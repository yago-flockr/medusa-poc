"use client"

import { DataState } from "@/components/display/data-state"
import { Badge } from "@/components/ui/badge"
import { VendorSection } from "@/vendor/components/section"
import {
  ShopifyConnectionForm,
  shopifyConnectionFormToInput,
  shopifyConnectionInputToForm,
} from "@/vendor/forms/shopify-connection-form"
import {
  ShopifyImportProductsForm,
  shopifyImportProductsFormToInput,
} from "@/vendor/forms/shopify-import-products-form"
import { useGetVendorsMe } from "@/vendor/hooks/queries/vendor"
import { useGetVendorsShopifyProducts } from "@/vendor/hooks/queries/shopify-products"
import {
  useGetVendorsShopifyConnectionInstallLink,
  usePatchVendorsShopifyConnection,
  usePostVendorsShopifyProductsImport,
} from "@/vendor/hooks/mutations/shopify"
import { toast } from "sonner"

export default function VendorShopifyPage() {
  const getVendorsMe = useGetVendorsMe()
  const patchVendorsShopifyConnection = usePatchVendorsShopifyConnection()
  const getVendorsShopifyConnectionInstallLink =
    useGetVendorsShopifyConnectionInstallLink()

  const shopifyConnection =
    getVendorsMe.data?.vendor.integration_connections?.find(
      (connection) => connection.provider === "shopify",
    )
  const isConnected = shopifyConnection?.connected ?? false

  const getVendorsShopifyProducts = useGetVendorsShopifyProducts(undefined, {
    enabled: isConnected,
  })
  const postVendorsShopifyProductsImport = usePostVendorsShopifyProductsImport()

  return (
    <>
      <VendorSection
        title="Shopify connection"
        description={
          isConnected
            ? shopifyConnection?.external_account_identifier
            : "Not connected."
        }
        action={
          isConnected ? (
            <Badge variant="success">Connected</Badge>
          ) : (
            <Badge variant="outline">Not connected</Badge>
          )
        }
        className="flex flex-col gap-4"
      >
        <DataState isLoading={getVendorsMe.isLoading || !getVendorsMe.data}>
          <DataState.Loading />
          <DataState.Content>
            <ShopifyConnectionForm
              defaultValues={
                shopifyConnection
                  ? shopifyConnectionInputToForm(shopifyConnection)
                  : undefined
              }
              isLoading={
                patchVendorsShopifyConnection.isPending ||
                getVendorsShopifyConnectionInstallLink.isPending
              }
              onSubmit={(values) =>
                patchVendorsShopifyConnection.mutate(
                  shopifyConnectionFormToInput(values),
                  {
                    onSuccess: () => {
                      toast.success("Shopify connection saved")
                      getVendorsShopifyConnectionInstallLink.mutate(undefined, {
                        onSuccess: (data) => {
                          window.location.href = data.install_link
                        },
                      })
                    },
                  },
                )
              }
            />
          </DataState.Content>
        </DataState>
      </VendorSection>
      {isConnected && (
        <VendorSection
          title="Import products"
          description="Pull products from your Shopify store and choose which ones to bring in."
          className="flex flex-col gap-4"
        >
          <DataState
            isLoading={getVendorsShopifyProducts.isLoading}
            isEmpty={getVendorsShopifyProducts.data?.products.length === 0}
          >
            <DataState.Loading />
            <DataState.Empty>
              <p className="text-sm text-muted-foreground">
                No products found in your Shopify store.
              </p>
            </DataState.Empty>
            <DataState.Content>
              <ShopifyImportProductsForm
                products={getVendorsShopifyProducts.data?.products ?? []}
                isLoading={postVendorsShopifyProductsImport.isPending}
                onSubmit={(values) =>
                  postVendorsShopifyProductsImport.mutate(
                    shopifyImportProductsFormToInput(values),
                    {
                      onSuccess: (data) => {
                        toast.success(
                          `${data.created_count} created, ${data.updated_count} updated`,
                        )
                        getVendorsShopifyProducts.refetch()
                      },
                    },
                  )
                }
              />
            </DataState.Content>
          </DataState>
        </VendorSection>
      )}
    </>
  )
}
