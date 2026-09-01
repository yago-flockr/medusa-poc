import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  vendorMeResponseSchema,
  type VendorMeResponse,
} from "@dtc/api-contracts/vendor/me"
import { vendorIntegrationConnectionProviderSchema } from "@dtc/api-contracts/vendor/integration-connection"
import {
  updateVendorProfileResponseSchema,
  type UpdateVendorProfileInput,
  type UpdateVendorProfileResponse,
} from "@dtc/api-contracts/vendor/profile"
import { resolveVendorUser } from "../resolve-vendor-user"
import { updateVendorUserWorkflow } from "../../../workflows/update-vendor-user"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "id",
    "first_name",
    "last_name",
    "email",
    "vendor.id",
    "vendor.name",
    "vendor.handle",
    "vendor.integration_connections.provider",
    "vendor.integration_connections.external_account_identifier",
    "vendor.integration_connections.client_id",
    "vendor.integration_connections.connected_at",
  ])

  const response: VendorMeResponse = {
    vendor_user: {
      id: vendorUser.id,
      first_name: vendorUser.first_name,
      last_name: vendorUser.last_name,
      email: vendorUser.email,
    },
    vendor: {
      id: vendorUser.vendor.id,
      name: vendorUser.vendor.name,
      handle: vendorUser.vendor.handle,
      integration_connections: (vendorUser.vendor.integration_connections ?? [])
        .filter((connection): connection is NonNullable<typeof connection> => connection !== null)
        .flatMap((connection) => {
          const provider = vendorIntegrationConnectionProviderSchema.safeParse(
            connection.provider,
          )

          return provider.success
            ? [
                {
                  provider: provider.data,
                  external_account_identifier: connection.external_account_identifier,
                  client_id: connection.client_id,
                  connected: connection.connected_at !== null,
                },
              ]
            : []
        }),
    },
  }

  res.json(vendorMeResponseSchema.parse(response))
}

export const PATCH = async (
  req: AuthenticatedMedusaRequest<UpdateVendorProfileInput>,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { first_name, last_name } = req.validatedBody

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "id",
  ])

  const { result } = await updateVendorUserWorkflow(req.scope).run({
    input: { id: vendorUser.id, first_name, last_name },
  })

  const updatedVendorUser = result as unknown as {
    id: string
    first_name: string | null
    last_name: string | null
  }

  const response: UpdateVendorProfileResponse = {
    vendor_user: {
      id: updatedVendorUser.id,
      first_name: updatedVendorUser.first_name,
      last_name: updatedVendorUser.last_name,
    },
  }

  res.json(updateVendorProfileResponseSchema.parse(response))
}
