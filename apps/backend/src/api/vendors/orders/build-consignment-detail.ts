import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { getOrderDetailWorkflow } from "@medusajs/medusa/core-flows"
import type {
  GetVendorsOrdersByIdResponse,
  VendorOrderFulfillmentStatus,
} from "@dtc/api-contracts/vendor/orders"

type ConsignmentItem = {
  id: string
  title: string
  variant_title: string | null
  variant_sku: string | null
  quantity: number
  unit_price: number
  total: number
  fulfilled_quantity: number
  shipped_quantity: number
  delivered_quantity: number
}

// The order's own fulfillment_status covers every vendor's items combined —
// a vendor needs to know the state of just its own slice, so it's derived
// here from that consignment's own items rather than read off a shared
// field. See docs/spikes/multi-vendor-order.md, friction #1.
function deriveFulfillmentStatus(items: ConsignmentItem[]): VendorOrderFulfillmentStatus {
  const totals = items.reduce(
    (sum, item) => ({
      quantity: sum.quantity + item.quantity,
      fulfilled: sum.fulfilled + item.fulfilled_quantity,
      shipped: sum.shipped + item.shipped_quantity,
      delivered: sum.delivered + item.delivered_quantity,
    }),
    { quantity: 0, fulfilled: 0, shipped: 0, delivered: 0 },
  )

  if (totals.quantity === 0) {
    return "not_fulfilled"
  }
  if (totals.delivered >= totals.quantity) {
    return "delivered"
  }
  if (totals.delivered > 0) {
    return "partially_delivered"
  }
  if (totals.shipped >= totals.quantity) {
    return "shipped"
  }
  if (totals.shipped > 0) {
    return "partially_shipped"
  }
  if (totals.fulfilled >= totals.quantity) {
    return "fulfilled"
  }
  if (totals.fulfilled > 0) {
    return "partially_fulfilled"
  }
  return "not_fulfilled"
}

export async function buildConsignmentDetail(
  container: MedusaContainer,
  consignmentId: string,
): Promise<GetVendorsOrdersByIdResponse> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [consignment],
  } = await query.graph({
    entity: "consignment",
    fields: ["id", "status", "order.id"],
    filters: { id: consignmentId },
  })

  if (!consignment?.order?.id) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Consignment with id: ${consignmentId} was not found`,
    )
  }

  const { result: order } = await getOrderDetailWorkflow(container).run({
    input: {
      order_id: consignment.order.id,
      fields: [
        "id",
        "display_id",
        "status",
        "currency_code",
        "total",
        "summary.*",
        "items.*",
        "items.tax_lines.*",
        "items.adjustments.*",
        "items.consignment.id",
        "items.detail.fulfilled_quantity",
        "items.detail.shipped_quantity",
        "items.detail.delivered_quantity",
        "shipping_address.first_name",
        "shipping_address.last_name",
        "shipping_address.address_1",
        "shipping_address.address_2",
        "shipping_address.city",
        "shipping_address.province",
        "shipping_address.postal_code",
        "shipping_address.country_code",
        "shipping_address.phone",
      ],
    },
  })

  type OrderItemWithConsignment = NonNullable<NonNullable<typeof order.items>[number]> & {
    consignment?: { id: string } | null
  }

  const items: ConsignmentItem[] = ((order.items ?? []) as OrderItemWithConsignment[])
    .filter(
      (item): item is OrderItemWithConsignment =>
        item != null && item.consignment?.id === consignmentId,
    )
    .map((item) => ({
      id: item.id,
      title: item.title,
      variant_title: item.variant_title ?? null,
      variant_sku: item.variant_sku ?? null,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      total: Number(item.total),
      fulfilled_quantity: Number(item.detail?.fulfilled_quantity ?? 0),
      shipped_quantity: Number(item.detail?.shipped_quantity ?? 0),
      delivered_quantity: Number(item.detail?.delivered_quantity ?? 0),
    }))

  // Each item.total is already tax/promotion-inclusive — Medusa computes it
  // per line (triggered by the sibling summary/tax_lines/adjustments fields
  // requested above), so summing it here already nets in this vendor's own
  // tax and discount allocation correctly. What's NOT included: this
  // vendor's own shipping cost — every vendor's shipping is free today (see
  // create-vendor-stock-location), so it's a no-op in practice, but a real
  // per-vendor shipping price would need its cost added in here explicitly.
  const total = items.reduce((sum, item) => sum + item.total, 0)

  return {
    id: consignment.id,
    display_id: Number(order.display_id),
    status: order.status,
    fulfillment_status: deriveFulfillmentStatus(items),
    consignment_status: consignment.status,
    total,
    currency_code: order.currency_code,
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      variant_title: item.variant_title,
      variant_sku: item.variant_sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
    shipping_address: order.shipping_address
      ? {
          first_name: order.shipping_address.first_name ?? null,
          last_name: order.shipping_address.last_name ?? null,
          address_1: order.shipping_address.address_1 ?? null,
          address_2: order.shipping_address.address_2 ?? null,
          city: order.shipping_address.city ?? null,
          province: order.shipping_address.province ?? null,
          postal_code: order.shipping_address.postal_code ?? null,
          country_code: order.shipping_address.country_code ?? null,
          phone: order.shipping_address.phone ?? null,
        }
      : null,
  }
}
