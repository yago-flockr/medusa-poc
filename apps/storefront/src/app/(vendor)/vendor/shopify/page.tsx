"use client"

import { DataState } from "@/components/display/data-state"
import { Badge } from "@/components/ui/badge"
import { VendorSection } from "@/vendor/components/section"
import { useGetMe } from "@/vendor/hooks/queries/vendor"

export default function VendorShopifyPage() {
  const getMe = useGetMe()

  const shopifyConnection = getMe.data?.vendor.integration_connections?.find(
    (connection) => connection.provider === "shopify",
  )
  const isConnected = shopifyConnection?.connected ?? false

  return (
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
      className="flex flex-col gap-2"
    >
      <DataState isLoading={getMe.isLoading || !getMe.data}>
        <DataState.Loading />
        <DataState.Content>
          <p className="text-sm text-muted-foreground">
            {isConnected
              ? "Your Shopify store is connected."
              : "No Shopify store connected yet."}
          </p>
        </DataState.Content>
      </DataState>
    </VendorSection>
  )
}
