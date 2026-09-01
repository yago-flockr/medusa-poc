"use client"

import { DataState } from "@/components/display/data-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VendorSection } from "@/vendor/components/section"
import { ShopifyConnectionForm } from "@/vendor/forms/shopify-connection-form"
import { ShopifyProductsChecklist } from "@/vendor/forms/shopify-products-checklist"
import {
  useGetShopifyInstallLink,
  useSetShopifyConnection,
} from "@/vendor/hooks/mutations/shopify"
import { usePullShopifyProducts } from "@/vendor/hooks/queries/shopify-products"
import { useGetMe } from "@/vendor/hooks/queries/vendor"
import type { SetVendorShopifyConnectionInput } from "@dtc/api-contracts/vendor/shopify-connection"
import { useState } from "react"

export default function VendorShopifyPage() {
  const getMe = useGetMe()
  const setShopifyConnection = useSetShopifyConnection()
  const getShopifyInstallLink = useGetShopifyInstallLink()
  const [isImporting, setIsImporting] = useState(false)

  const vendor = getMe.data?.vendor
  const shopifyConnection = vendor?.integration_connections?.find(
    (connection) => connection.provider === "shopify",
  )
  const isConnected = shopifyConnection?.connected ?? false

  const pullShopifyProducts = usePullShopifyProducts(undefined, {
    enabled: isConnected && isImporting,
  })

  const handleConnect = (values: SetVendorShopifyConnectionInput) => {
    setShopifyConnection.mutate(values, {
      onSuccess: () => {
        getMe.refetch()
        getShopifyInstallLink.mutate(undefined, {
          onSuccess: ({ install_link: installLink }) => {
            window.open(installLink, "_blank")
          },
        })
      },
    })
  }

  const connectSubmitLabel = setShopifyConnection.isPending
    ? "Saving…"
    : getShopifyInstallLink.isPending
      ? "Opening Shopify…"
      : "Connect to Shopify"

  return (
    <>
      <VendorSection
        title="Shopify connection"
        description={
          isConnected
            ? shopifyConnection?.external_account_identifier
            : "Enter your store's credentials, then connect."
        }
        action={
          isConnected ? (
            <Badge variant="success">Connected</Badge>
          ) : (
            <Badge variant="outline">Not connected</Badge>
          )
        }
        className="flex flex-col gap-2"
      >
        <DataState isLoading={getMe.isLoading || !getMe.data}>
          <DataState.Loading />
          <DataState.Content>
            <ShopifyConnectionForm
              defaultValues={
                shopifyConnection?.external_account_identifier &&
                shopifyConnection?.client_id
                  ? {
                      shopify_store_domain: shopifyConnection.external_account_identifier,
                      shopify_client_id: shopifyConnection.client_id,
                    }
                  : undefined
              }
              isLoading={setShopifyConnection.isPending || getShopifyInstallLink.isPending}
              submitLabel={connectSubmitLabel}
              error={
                setShopifyConnection.error?.message ??
                getShopifyInstallLink.error?.message
              }
              onSubmit={handleConnect}
            />
          </DataState.Content>
        </DataState>
      </VendorSection>

      {isConnected && (
        <VendorSection
          title="Import products"
          description="Choose what to bring in from your Shopify catalogue. Anything imported waits for staff approval before customers can see it — re-importing an already-imported product updates it and sends it back for approval."
          className="flex flex-col gap-2"
        >
          <Button
            type="button"
            variant="outline"
            disabled={pullShopifyProducts.isFetching}
            onClick={() => {
              setIsImporting(true)
              pullShopifyProducts.refetch()
            }}
          >
            {pullShopifyProducts.isFetching
              ? "Refreshing…"
              : "Refresh catalogue"}
          </Button>
          <DataState
            isLoading={pullShopifyProducts.isLoading}
            isEmpty={pullShopifyProducts.data?.products.length === 0}
          >
            <DataState.Loading />
            <DataState.Empty>
              <p className="text-sm text-muted-foreground">
                No products found in your Shopify store.
              </p>
            </DataState.Empty>
            <DataState.Content>
              {pullShopifyProducts.isError && (
                <p className="text-sm text-destructive">
                  {pullShopifyProducts.error.message}
                </p>
              )}
              {pullShopifyProducts.data && (
                <ShopifyProductsChecklist
                  products={pullShopifyProducts.data.products}
                  onImported={() => pullShopifyProducts.refetch()}
                />
              )}
            </DataState.Content>
          </DataState>
        </VendorSection>
      )}
    </>
  )
}
