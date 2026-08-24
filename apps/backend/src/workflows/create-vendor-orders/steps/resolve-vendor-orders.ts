import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { OrderDTO } from "@medusajs/framework/types"
import vendorOrderLink from "../../../links/vendor-order"

export type ResolveVendorOrdersStepInput = {
  orderId: string
  parentOrder: OrderDTO
}

// Runs unconditionally, whether this call created the vendor orders just
// now or they already existed from an earlier, successful attempt — so a
// retry after a client timeout still gets the real vendor orders back
// instead of losing them from the response.
export const resolveVendorOrdersStep = createStep(
  "resolve-vendor-orders",
  async (
    { orderId, parentOrder }: ResolveVendorOrdersStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: directLinks } = await query.graph({
      entity: vendorOrderLink.entryPoint,
      fields: ["vendor.id"],
      filters: { order_id: orderId },
    })

    const directVendorIds = directLinks
      .map((link) => link.vendor?.id)
      .filter((id): id is string => Boolean(id))

    if (directVendorIds.length) {
      return new StepResponse(
        directVendorIds.map((vendorId) => ({ ...parentOrder, vendor_id: vendorId })),
      )
    }

    const { data: childOrders } = await query.graph({
      entity: "order",
      fields: [
        "*",
        "items.*",
        "shipping_address.*",
        "billing_address.*",
        "shipping_methods.*",
      ],
      filters: { metadata: { parent_order_id: orderId } } as Record<
        string,
        unknown
      >,
    })

    if (!childOrders.length) {
      return new StepResponse([])
    }

    const { data: childLinks } = await query.graph({
      entity: vendorOrderLink.entryPoint,
      fields: ["order.id", "vendor.id"],
      filters: { order_id: childOrders.map((order) => order.id) },
    })

    const vendorIdByOrderId = new Map(
      childLinks
        .filter((link) => link.order?.id && link.vendor?.id)
        .map((link) => [link.order!.id, link.vendor!.id]),
    )

    const vendorOrders = childOrders
      .filter((order) => vendorIdByOrderId.has(order.id))
      .map((order) => ({
        ...(order as unknown as OrderDTO),
        vendor_id: vendorIdByOrderId.get(order.id)!,
      }))

    return new StepResponse(vendorOrders)
  },
)
