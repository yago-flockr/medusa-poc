import type {
  GetVendorsOrdersByIdResponse,
  VendorConsignmentStatus,
} from "@dtc/api-contracts/vendor/orders"
import type { OrderDetail } from "../steps/get-consignment-order"
import { deriveFulfillmentStatus } from "./derive-fulfillment-status"

export type BuildConsignmentDetailParams = {
  consignmentId: string
  consignmentStatus: VendorConsignmentStatus
  order: OrderDetail
}

export function buildConsignmentDetail({
  consignmentId,
  consignmentStatus,
  order,
}: BuildConsignmentDetailParams): GetVendorsOrdersByIdResponse {
  const items = (order.items ?? []).filter(
    (item) => item.consignment?.id === consignmentId,
  )

  // TODO: shipping is free today so it's excluded — add per-vendor cost here once that changes.
  const total = items.reduce((sum, item) => sum + item.total, 0)

  return {
    id: consignmentId,
    display_id: order.display_id,
    status: order.status,
    fulfillment_status: deriveFulfillmentStatus(
      items.map((item) => ({
        quantity: item.quantity,
        fulfilled_quantity: item.detail?.fulfilled_quantity ?? 0,
        shipped_quantity: item.detail?.shipped_quantity ?? 0,
        delivered_quantity: item.detail?.delivered_quantity ?? 0,
      })),
    ),
    consignment_status: consignmentStatus,
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
    shipping_address: order.shipping_address,
  }
}
