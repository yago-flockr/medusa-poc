import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  deleteVendorsStockLocationsByIdResponseSchema,
  postVendorsStockLocationsResponseSchema,
  type PostVendorsStockLocationsByIdInput,
  type PostVendorsStockLocationsResponse,
} from "@dtc/api-contracts/vendor/stock-locations"
import { deleteVendorStockLocationWorkflow } from "../../../../workflows/delete-vendor-stock-location"
import { updateVendorStockLocationWorkflow } from "../../../../workflows/update-vendor-stock-location"
import { resolveVendorUser } from "../../resolve-vendor-user"
import { assertOwnedVendorStockLocation } from "../assert-owned-stock-location"

export const POST = async (
  req: AuthenticatedMedusaRequest<PostVendorsStockLocationsByIdInput>,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  await assertOwnedVendorStockLocation(query, id, vendorUser.vendor_id)

  const { name, address } = req.validatedBody

  const { result } = await updateVendorStockLocationWorkflow(req.scope).run({
    input: { id, name, address },
  })

  const response: PostVendorsStockLocationsResponse = {
    stock_location: {
      id: result.id,
      name: result.name,
      address: result.address
        ? {
            address_1: result.address.address_1,
            address_2: result.address.address_2 ?? null,
            city: result.address.city ?? null,
            province: result.address.province ?? null,
            postal_code: result.address.postal_code ?? null,
            country_code: result.address.country_code,
            phone: result.address.phone ?? null,
          }
        : null,
    },
  }

  res.json(postVendorsStockLocationsResponseSchema.parse(response))
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  await assertOwnedVendorStockLocation(query, id, vendorUser.vendor_id)

  const { result } = await deleteVendorStockLocationWorkflow(req.scope).run({
    input: { id },
  })

  res.json(deleteVendorsStockLocationsByIdResponseSchema.parse(result))
}
