import {
  createWorkflow,
  parallelize,
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
import { assertItemsFulfillableStep } from "./steps/assert-items-fulfillable"
import { createVendorOrdersStep } from "./steps/create-vendor-orders"
import { groupVendorItemsStep } from "./steps/group-vendor-items"
import { resolveVendorOrdersStep } from "./steps/resolve-vendor-orders"

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

    const cartItems = transform({ carts }, (data) =>
      (data.carts[0].items ?? []).filter(
        (item): item is NonNullable<typeof item> => item != null,
      ),
    ) as unknown as CartLineItemDTO[]

    assertItemsFulfillableStep({ items: cartItems })

    // ttl has no renewal (Medusa's default lock provider expires it
    // unconditionally at ttl regardless of whether this run finished) — 60s
    // is a pragmatic margin against real DB latency, not a full fix. A real
    // fix needs either lock renewal or a DB-level unique constraint behind
    // the idempotency checks below, which are point-in-time queries with
    // no constraint backing them.
    acquireLockStep({
      key: input.cart_id,
      timeout: 2,
      ttl: 60,
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
    const [{ data: existingVendorLinks }, { data: existingChildOrders }] = parallelize(
      useQueryGraphStep({
        entity: vendorOrderLink.entryPoint,
        fields: ["vendor.id"],
        filters: { order_id: orderId },
      }).config({ name: "retrieve-existing-vendor-order-links" }),
      useQueryGraphStep({
        entity: "order",
        fields: ["id"],
        filters: { metadata: { parent_order_id: orderId } } as Record<
          string,
          unknown
        >,
      }).config({ name: "retrieve-existing-vendor-orders" }),
    )

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

    when(
      "create-vendor-order-links",
      { existingVendorLinks, existingChildOrders },
      (data) =>
        data.existingVendorLinks.length === 0 &&
        data.existingChildOrders.length === 0,
    ).then(() => {
      const { vendorsItems } = groupVendorItemsStep({ items: cartItems })

      const { linkDefs } = createVendorOrdersStep({
        parentOrder: order,
        vendorsItems,
      })

      createRemoteLinkStep(linkDefs)
    })

    // Runs regardless of whether the block above just created the vendor
    // orders or they already existed from an earlier attempt — otherwise a
    // retry after a client timeout would return vendorOrders: undefined
    // even though the vendor orders exist in the DB.
    const vendorOrders = resolveVendorOrdersStep({ orderId, parentOrder: order })

    releaseLockStep({ key: input.cart_id })

    return new WorkflowResponse({ order, vendorOrders })
  },
)

export default createVendorOrdersWorkflow
