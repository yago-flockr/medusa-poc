"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ShopifyConnectionForm } from "@/vendor/forms/shopify-connection-form"
import {
  useGetVendorShopifyInstallLink,
  usePullVendorShopifyProducts,
} from "@/vendor/hooks/mutations/shopify"
import { useFindOneVendor } from "@/vendor/hooks/queries/vendor"
import JsonView from "@uiw/react-json-view"

export default function VendorShopifyPage() {
  const findOneVendor = useFindOneVendor()
  const getVendorShopifyInstallLink = useGetVendorShopifyInstallLink()
  const pullVendorShopifyProducts = usePullVendorShopifyProducts()

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Shopify connection</CardTitle>
          <CardDescription>
            {findOneVendor.data?.vendor.shopify_connected
              ? `Connected to ${findOneVendor.data.vendor.shopify_store_domain}`
              : "Enter your store's credentials, then connect."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {findOneVendor.isLoading || !findOneVendor.data ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <ShopifyConnectionForm
              defaultValues={
                findOneVendor.data.vendor.shopify_store_domain &&
                findOneVendor.data.vendor.shopify_client_id
                  ? {
                      shopify_store_domain:
                        findOneVendor.data.vendor.shopify_store_domain,
                      shopify_client_id:
                        findOneVendor.data.vendor.shopify_client_id,
                    }
                  : undefined
              }
              onSaved={() => findOneVendor.refetch()}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connect</CardTitle>
          <CardDescription>
            Authorize our app on your Shopify store.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pull products</CardTitle>
          <CardDescription>
            Fetches your Shopify catalogue and logs it — nothing is imported
            yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
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
        </CardContent>
      </Card>
    </div>
  )
}
