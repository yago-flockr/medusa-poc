import type { MedusaContainer } from "@medusajs/framework/types"
import { getOrderDetailWorkflow } from "@medusajs/medusa/core-flows"
import type {
  GetVendorsOrdersByIdResponse,
  VendorConsignmentStatus,
} from "@dtc/api-contracts/vendor/orders"

export async function buildVendorOrderDetail(
  container: MedusaContainer,
  orderId: string,
): Promise<GetVendorsOrdersByIdResponse> {
  const { result: order } = await getOrderDetailWorkflow(container).run({
    input: {
      order_id: orderId,
      fields: [
        "id",
        "display_id",
        "status",
        "fulfillment_status",
        "total",
        "currency_code",
        "metadata",
        "items.*",
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

  const consignmentStatus = ((order.metadata?.consignment_status as
    | VendorConsignmentStatus
    | undefined) ?? "placed") satisfies VendorConsignmentStatus

  return {
    id: order.id,
    display_id: Number(order.display_id),
    status: order.status,
    fulfillment_status: order.fulfillment_status,
    consignment_status: consignmentStatus,
    total: Number(order.total),
    currency_code: order.currency_code,
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      variant_title: item.variant_title ?? null,
      variant_sku: item.variant_sku ?? null,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
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
