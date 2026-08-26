"use client"

import { DataState } from "@/components/display/data-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { VendorSection } from "@/vendor/components/section"
import { ShopifyConnectionForm } from "@/vendor/forms/shopify-connection-form"
import { useGetShopifyInstallLink } from "@/vendor/hooks/mutations/shopify"
import { usePullShopifyProducts } from "@/vendor/hooks/queries/shopify-products"
import { useGetMe } from "@/vendor/hooks/queries/vendor"
import JsonView from "@uiw/react-json-view"

export default function VendorShopifyPage() {
  const getMe = useGetMe()
  const getShopifyInstallLink = useGetShopifyInstallLink()

  const vendor = getMe.data?.vendor
  const isConnected = vendor?.shopify_connected ?? false

  const pullShopifyProducts = usePullShopifyProducts(undefined, {
    enabled: isConnected,
  })

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
        <DataState isLoading={getMe.isLoading || !getMe.data}>
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
              onSaved={() => getMe.refetch()}
            />
            <Separator className="my-4" />
            <Button
              type="button"
              disabled={getShopifyInstallLink.isPending}
              className="w-full"
              onClick={() => {
                getShopifyInstallLink.mutate(undefined, {
                  onSuccess: ({ installLink }) => {
                    window.open(installLink, "_blank")
                  },
                })
              }}
            >
              {getShopifyInstallLink.isPending
                ? "Generating link…"
                : "Connect to Shopify"}
            </Button>
            {getShopifyInstallLink.isError && (
              <p className="text-sm text-destructive">
                {getShopifyInstallLink.error.message}
              </p>
            )}
          </DataState.Content>
        </DataState>
      </VendorSection>

      {isConnected && (
        <VendorSection
          title="Pull products"
          description="Fetches your Shopify catalogue — nothing is imported yet."
          className="flex flex-col gap-3"
        >
          <Button
            type="button"
            variant="outline"
            disabled={pullShopifyProducts.isFetching}
            onClick={() => pullShopifyProducts.refetch()}
          >
            {pullShopifyProducts.isFetching ? "Pulling…" : "Pull products"}
          </Button>
          <DataState isLoading={pullShopifyProducts.isLoading}>
            <DataState.Loading />
            <DataState.Content>
              {pullShopifyProducts.isError && (
                <p className="text-sm text-destructive">
                  {pullShopifyProducts.error.message}
                </p>
              )}
              {pullShopifyProducts.data && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Pulled {pullShopifyProducts.data.products.length}{" "}
                    product(s).
                  </p>
                  <JsonView
                    value={pullShopifyProducts.data}
                    collapsed={2}
                    className="text-sm"
                  />
                </>
              )}
            </DataState.Content>
          </DataState>
        </VendorSection>
      )}
    </>
  )
}
