import {
  createWorkflow,
  transform,
  WorkflowResponse,
  when,
} from "@medusajs/framework/workflows-sdk"
import {
  acquireLockStep,
  completeCartWorkflow,
  createRemoteLinkStep,
  getOrderDetailWorkflow,
  releaseLockStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import type { CartLineItemDTO } from "@medusajs/framework/types"
import vendorOrderLink from "../../links/vendor-order"
import { createVendorOrdersStep } from "./steps/create-vendor-orders"
import { groupVendorItemsStep } from "./steps/group-vendor-items"

export type CreateVendorOrdersWorkflowInput = {
  cart_id: string
}

export const createVendorOrdersWorkflow = createWorkflow(
  "create-vendor-orders",
  function (input: CreateVendorOrdersWorkflowInput) {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ["id", "items.*"],
      filters: { id: input.cart_id },
      options: { throwIfKeyNotFound: true },
    })

    acquireLockStep({
      key: input.cart_id,
      timeout: 2,
      ttl: 10,
    })

    const { id: orderId } = completeCartWorkflow.runAsStep({
      input: { id: input.cart_id },
    })

    // Two independent idempotency checks are needed, not one: the
    // single-vendor branch of createVendorOrdersStep links the vendor
    // directly to the parent order (no child order exists), while the
    // multi-vendor branch links each vendor to its own child order, tagged
    // with metadata.parent_order_id. Checking only the vendor-order link by
    // parent order id (as the official recipe does) misses every retry of a
    // multi-vendor cart, since no link ever points at the parent's id in
    // that branch — see docs/spikes/multi-vendor-order.md proof #6.
    const { data: existingVendorLinks } = useQueryGraphStep({
      entity: vendorOrderLink.entryPoint,
      fields: ["vendor.id"],
      filters: { order_id: orderId },
    }).config({ name: "retrieve-existing-vendor-order-links" })

    const { data: existingChildOrders } = useQueryGraphStep({
      entity: "order",
      fields: ["id"],
      filters: { metadata: { parent_order_id: orderId } } as Record<
        string,
        unknown
      >,
    }).config({ name: "retrieve-existing-vendor-orders" })

    const order = getOrderDetailWorkflow.runAsStep({
      input: {
        order_id: orderId,
        fields: [
          "region_id",
          "customer_id",
          "sales_channel_id",
          "email",
          "currency_code",
          "shipping_address.*",
          "billing_address.*",
          "shipping_methods.*",
        ],
      },
    })

    const vendorOrders = when(
      "create-vendor-order-links",
      { existingVendorLinks, existingChildOrders },
      (data) =>
        data.existingVendorLinks.length === 0 &&
        data.existingChildOrders.length === 0,
    ).then(() => {
      const items = transform({ carts }, (data) =>
        (data.carts[0].items ?? []).filter(
          (item): item is NonNullable<typeof item> => item != null,
        ),
      ) as unknown as CartLineItemDTO[]

      const { vendorsItems } = groupVendorItemsStep({ items })

      const { orders, linkDefs } = createVendorOrdersStep({
        parentOrder: order,
        vendorsItems,
      })

      createRemoteLinkStep(linkDefs)

      return orders
    })

    releaseLockStep({ key: input.cart_id })

    return new WorkflowResponse({ order, vendorOrders })
  },
)

export default createVendorOrdersWorkflow
