import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createVendorStockLocationResponseSchema,
  vendorStockLocationsListResponseSchema,
  type CreateVendorStockLocation,
  type CreateVendorStockLocationResponse,
  type VendorStockLocationsListResponse,
} from "@dtc/api-contracts/vendor/stock-locations"
import { createVendorStockLocationWorkflow } from "../../../workflows/create-vendor-stock-location"
import { parseListQuery } from "../../../lib/list-query"
import { resolveVendorUser } from "../resolve-vendor-user"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { limit, offset } = parseListQuery(req.query)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  const { data: stockLocations, metadata } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "address.*"],
    filters: { vendor: { id: vendorUser.vendor_id } },
    pagination: { skip: offset, take: limit },
  })

  const response: VendorStockLocationsListResponse = {
    stock_locations: stockLocations.map((location) => ({
      id: location.id,
      name: location.name,
      address: location.address
        ? {
            address_1: location.address.address_1,
            address_2: location.address.address_2 ?? null,
            city: location.address.city ?? null,
            province: location.address.province ?? null,
            postal_code: location.address.postal_code ?? null,
            country_code: location.address.country_code,
            phone: location.address.phone ?? null,
          }
        : null,
    })),
    count: metadata?.count ?? 0,
    limit,
    offset,
  }

  res.json(vendorStockLocationsListResponseSchema.parse(response))
}

export const POST = async (
  req: AuthenticatedMedusaRequest<CreateVendorStockLocation>,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  const { name, address } = req.validatedBody

  const { result } = await createVendorStockLocationWorkflow(req.scope).run({
    input: {
      vendorId: vendorUser.vendor_id,
      name,
      address,
    },
  })

  const response: CreateVendorStockLocationResponse = {
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

  res.json(createVendorStockLocationResponseSchema.parse(response))
}
