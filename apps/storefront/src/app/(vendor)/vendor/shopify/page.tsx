"use client"

import { DataState } from "@/components/display/data-state"
import { ErrorAlert } from "@/components/display/error-alert"
import { Badge } from "@/components/ui/badge"
import { VendorSection } from "@/vendor/components/section"
import {
  ShopifyConnectionForm,
  shopifyConnectionFormToInput,
  shopifyConnectionInputToForm,
} from "@/vendor/forms/shopify-connection-form"
import { useGetVendorsMe } from "@/vendor/hooks/queries/vendor"
import {
  useGetVendorsMeShopifyConnectionInstallLink,
  usePatchVendorsMeShopifyConnection,
} from "@/vendor/hooks/mutations/shopify"
import { toast } from "sonner"

export default function VendorShopifyPage() {
  const getVendorsMe = useGetVendorsMe()
  const patchVendorsMeShopifyConnection = usePatchVendorsMeShopifyConnection()
  const getVendorsMeShopifyConnectionInstallLink =
    useGetVendorsMeShopifyConnectionInstallLink()

  const shopifyConnection = getVendorsMe.data?.vendor.integration_connections?.find(
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
                    getVendorsMeShopifyConnectionInstallLink.mutate(undefined, {
                      onSuccess: (data) => {
                        window.location.href = data.install_link
                      },
                    })
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
              description={getVendorsMeShopifyConnectionInstallLink.error.message}
            />
          )}
        </DataState.Content>
      </DataState>
    </VendorSection>
  )
}
