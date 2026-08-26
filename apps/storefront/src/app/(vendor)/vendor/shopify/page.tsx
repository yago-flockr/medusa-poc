"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShopifyConnectionForm } from "@/vendor/forms/shopify-connection-form"
import {
  useGetVendorShopifyInstallLink,
  usePullVendorShopifyProducts,
} from "@/vendor/hooks/mutations/shopify"
import { useFindOneVendor } from "@/vendor/hooks/queries/vendor"
import { VendorSection } from "@/vendor/components/section"
import { DataState } from "@/components/display/data-state"
import JsonView from "@uiw/react-json-view"

export default function VendorShopifyPage() {
  const findOneVendor = useFindOneVendor()
  const getVendorShopifyInstallLink = useGetVendorShopifyInstallLink()
  const pullVendorShopifyProducts = usePullVendorShopifyProducts()

  const vendor = findOneVendor.data?.vendor
  const isConnected = vendor?.shopify_connected ?? false

  return (
    <>
      <VendorSection
        title="Shopify connection"
        description={
          isConnected
            ? vendor?.shopify_store_domain
            : "Enter your store's credentials, then connect."
        }
        action={
          isConnected ? (
            <Badge className="border-transparent bg-green-100 text-green-700">
              Connected
            </Badge>
          ) : (
            <Badge variant="outline">Not connected</Badge>
          )
        }
      >
        <DataState isLoading={findOneVendor.isLoading || !findOneVendor.data}>
          <DataState.Loading />
          <DataState.Content>
            <ShopifyConnectionForm
              defaultValues={
                vendor?.shopify_store_domain && vendor?.shopify_client_id
                  ? {
                      shopify_store_domain: vendor.shopify_store_domain,
                      shopify_client_id: vendor.shopify_client_id,
                    }
                  : undefined
              }
              onSaved={() => findOneVendor.refetch()}
            />
          </DataState.Content>
        </DataState>
      </VendorSection>

      <VendorSection
        title="Connect"
        description="Authorize our app on your Shopify store."
        className="flex flex-col gap-3"
      >
        <Button
          type="button"
          disabled={getVendorShopifyInstallLink.isPending}
          onClick={() => {
            getVendorShopifyInstallLink.mutate(undefined, {
              onSuccess: ({ installLink }) => {
                window.open(installLink, "_blank")
              },
            })
          }}
        >
          {getVendorShopifyInstallLink.isPending
            ? "Generating link…"
            : "Connect to Shopify"}
        </Button>
        {getVendorShopifyInstallLink.isError && (
          <p className="text-sm text-destructive">
            {getVendorShopifyInstallLink.error.message}
          </p>
        )}
      </VendorSection>

      <VendorSection
        title="Pull products"
        description="Fetches your Shopify catalogue and logs it — nothing is imported yet."
        className="flex flex-col gap-3"
      >
        <Button
          type="button"
          variant="outline"
          disabled={pullVendorShopifyProducts.isPending}
          onClick={() => {
            pullVendorShopifyProducts.mutate(undefined, {
              onSuccess: (result) => {
                console.log("Pulled Shopify:", result)
              },
            })
          }}
        >
          {pullVendorShopifyProducts.isPending ? "Pulling…" : "Pull products"}
        </Button>
        {pullVendorShopifyProducts.isError && (
          <p className="text-sm text-destructive">
            {pullVendorShopifyProducts.error.message}
          </p>
        )}
        {pullVendorShopifyProducts.isSuccess && (
          <>
            <p className="text-sm text-muted-foreground">
              Pulled {pullVendorShopifyProducts.data.products.length}{" "}
              product(s) — check the console.
            </p>
            {pullVendorShopifyProducts.data && (
              <JsonView
                value={pullVendorShopifyProducts.data}
                collapsed={2}
                className="text-sm"
              />
            )}
          </>
        )}
      </VendorSection>
    </>
  )
}
