import type { VendorOrder } from "@dtc/api-contracts/vendor/orders"
import type { ConsignmentListRow } from "../steps/list-consignments"

export function buildOrderList(
  consignments: ConsignmentListRow[],
): VendorOrder[] {
  return consignments
    .filter(
      (
        consignment,
      ): consignment is ConsignmentListRow & {
        order: NonNullable<ConsignmentListRow["order"]>
      } => consignment.order != null,
    )
    .map((consignment) => {
      const items = (consignment.order.items ?? []).filter(
        (item): item is NonNullable<typeof item> =>
          item?.id != null && item.consignment?.id === consignment.id,
      )

      return {
        id: consignment.id,
        display_id: consignment.order.display_id,
        consignment_status: consignment.status,
        total: items.reduce((sum, item) => sum + Number(item.total ?? 0), 0),
        currency_code: consignment.order.currency_code,
        earnings: {
          subtotal: consignment.subtotal,
          commission_rate: consignment.commission_rate,
          commission_total: consignment.commission_total,
          earning_total: consignment.earning_total,
        },
        items: items.map((item) => ({
          id: item.id!,
          title: item.title ?? "",
          quantity: Number(item.quantity ?? 0),
        })),
      }
    })
}
