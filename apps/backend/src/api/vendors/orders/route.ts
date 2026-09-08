import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  getVendorsOrdersResponseSchema,
  type VendorOrder,
  type GetVendorsOrdersResponse,
} from "@dtc/api-contracts/vendor/orders"
import { parseListQuery } from "../../../lib/list-query"
import { resolveVendorUser } from "../resolve-vendor-user"

type ConsignmentListRow = {
  id: string
  order?: {
    id: string
    display_id: number
    status: string
    currency_code: string
    items?:
      | ({
          id: string | null
          title: string | null
          quantity: number | null
          total: number | null
          consignment?: { id: string | null } | null
        } | null)[]
      | null
  } | null
}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { limit, offset } = parseListQuery(req.query)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  const { data: consignments, metadata } = await query.graph({
    entity: "consignment",
    fields: [
      "id",
      "order.id",
      "order.display_id",
      "order.status",
      "order.currency_code",
      "order.total",
      "order.summary.*",
      "order.items.*",
      "order.items.tax_lines.*",
      "order.items.adjustments.*",
      "order.items.consignment.id",
    ],
    filters: { vendor_id: vendorUser.vendor_id },
    pagination: { skip: offset, take: limit },
  })

  const orders: VendorOrder[] = (consignments as ConsignmentListRow[])
    .filter((consignment): consignment is ConsignmentListRow & { order: NonNullable<ConsignmentListRow["order"]> } =>
      consignment.order != null,
    )
    .map((consignment) => {
      const items = (consignment.order.items ?? []).filter(
        (item): item is NonNullable<typeof item> =>
          item?.id != null && item.consignment?.id === consignment.id,
      )

      return {
        id: consignment.id,
        display_id: consignment.order.display_id,
        status: consignment.order.status,
        total: items.reduce((sum, item) => sum + Number(item.total ?? 0), 0),
        currency_code: consignment.order.currency_code,
        items: items.map((item) => ({
          id: item.id!,
          title: item.title ?? "",
          quantity: Number(item.quantity ?? 0),
        })),
      }
    })

  const response: GetVendorsOrdersResponse = {
    orders,
    count: metadata?.count ?? orders.length,
    limit,
    offset,
  }

  res.json(getVendorsOrdersResponseSchema.parse(response))
}
