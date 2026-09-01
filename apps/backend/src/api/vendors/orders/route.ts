import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows"
import {
  vendorOrdersListResponseSchema,
  type VendorOrder,
  type VendorOrdersListResponse,
} from "@dtc/api-contracts/vendor/orders"
import { parseListQuery } from "../../../lib/list-query"
import { resolveVendorUser } from "../resolve-vendor-user"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { limit, offset } = parseListQuery(req.query)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor.orders.id",
  ])

  const orderIds = (vendorUser.vendor.orders ?? [])
    .filter((order): order is NonNullable<typeof order> => order != null)
    .map((order) => order.id)

  const { result } = await getOrdersListWorkflow(req.scope).run({
    input: {
      fields: [
        "id",
        "display_id",
        "status",
        "total",
        "currency_code",
        "items.*",
        "metadata",
      ],
      variables: {
        filters: { id: orderIds },
        skip: offset,
        take: limit,
      },
    },
  })

  const { rows: orders, metadata } = result as {
    rows: VendorOrder[]
    metadata: { count: number }
  }

  const response: VendorOrdersListResponse = {
    orders,
    count: metadata.count,
    limit,
    offset,
  }

  res.json(vendorOrdersListResponseSchema.parse(response))
}
