"use client"

import { DataState } from "@/components/display/data-state"
import { ErrorAlert } from "@/components/display/error-alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { useGetVendorsMeShopifyProducts } from "@/vendor/hooks/queries/shopify-products"
import {
  useGetVendorsMeShopifyConnectionInstallLink,
  usePatchVendorsMeShopifyConnection,
  usePostVendorsMeShopifyProductsImport,
} from "@/vendor/hooks/mutations/shopify"
import { toast } from "sonner"

export default function VendorShopifyPage() {
  const getVendorsMe = useGetVendorsMe()
  const patchVendorsMeShopifyConnection = usePatchVendorsMeShopifyConnection()
  const getVendorsMeShopifyConnectionInstallLink =
    useGetVendorsMeShopifyConnectionInstallLink()

  const shopifyConnection =
    getVendorsMe.data?.vendor.integration_connections?.find(
      (connection) => connection.provider === "shopify",
    )
  const isConnected = shopifyConnection?.connected ?? false

  const getVendorsMeShopifyProducts = useGetVendorsMeShopifyProducts(
    undefined,
    {
      enabled: isConnected,
    },
  )
  const postVendorsMeShopifyProductsImport =
    usePostVendorsMeShopifyProductsImport()

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
                patchVendorsMeShopifyConnection.isPending ||
                getVendorsMeShopifyConnectionInstallLink.isPending
              }
              onSubmit={(values) =>
                patchVendorsMeShopifyConnection.mutate(
                  shopifyConnectionFormToInput(values),
                  {
                    onSuccess: () => {
                      toast.success("Shopify connection saved")
                      getVendorsMeShopifyConnectionInstallLink.mutate(
                        undefined,
                        {
                          onSuccess: (data) => {
                            window.location.href = data.install_link
                          },
                        },
                      )
                    },
                  },
                )
              }
            />
            {patchVendorsMeShopifyConnection.error && (
              <ErrorAlert
                description={patchVendorsMeShopifyConnection.error.message}
              />
            )}
            {getVendorsMeShopifyConnectionInstallLink.error && (
              <ErrorAlert
                description={
                  getVendorsMeShopifyConnectionInstallLink.error.message
                }
              />
            )}
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
            isLoading={getVendorsMeShopifyProducts.isLoading}
            isEmpty={getVendorsMeShopifyProducts.data?.products.length === 0}
          >
            <DataState.Loading />
            <DataState.Empty>
              <p className="text-sm text-muted-foreground">
                No products found in your Shopify store.
              </p>
            </DataState.Empty>
            <DataState.Content>
              <ShopifyImportProductsForm
                products={getVendorsMeShopifyProducts.data?.products ?? []}
                isLoading={postVendorsMeShopifyProductsImport.isPending}
                onSubmit={(values) =>
                  postVendorsMeShopifyProductsImport.mutate(
                    shopifyImportProductsFormToInput(values),
                    {
                      onSuccess: (data) => {
                        toast.success(
                          `${data.created_count} created, ${data.updated_count} updated`,
                        )
                        getVendorsMeShopifyProducts.refetch()
                      },
                    },
                  )
                }
              />
              {postVendorsMeShopifyProductsImport.error && (
                <ErrorAlert
                  description={postVendorsMeShopifyProductsImport.error.message}
                />
              )}
            </DataState.Content>
          </DataState>
        </VendorSection>
      )}
    </>
  )
}
