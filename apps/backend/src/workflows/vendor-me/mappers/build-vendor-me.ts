import type { GetVendorsMeResponse } from "@dtc/api-contracts/vendor/me"
import { vendorIntegrationConnectionProviderSchema } from "@dtc/api-contracts/vendor/integration-connection"

type RawVendorMe = {
  id: string
  name: string | null
  email: string
  vendor: {
    id: string
    name: string
    handle: string
    integration_connections:
      | ({
          provider: string
          external_account_identifier: string | null
          client_id: string | null
          connected_at: string | Date | null
        } | null)[]
      | null
  }
}

export function buildVendorMe(vendorUser: RawVendorMe): GetVendorsMeResponse {
  return {
    vendor_user: {
      id: vendorUser.id,
      name: vendorUser.name,
      email: vendorUser.email,
    },
    vendor: {
      id: vendorUser.vendor.id,
      name: vendorUser.vendor.name,
      handle: vendorUser.vendor.handle,
      integration_connections: (vendorUser.vendor.integration_connections ?? [])
        .filter(
          (connection): connection is NonNullable<typeof connection> =>
            connection !== null,
        )
        .flatMap((connection) => {
          const provider = vendorIntegrationConnectionProviderSchema.safeParse(
            connection.provider,
          )

          return provider.success
            ? [
                {
                  provider: provider.data,
                  external_account_identifier:
                    connection.external_account_identifier,
                  client_id: connection.client_id,
                  connected: connection.connected_at !== null,
                },
              ]
            : []
        }),
    },
  }
}
