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
import consignmentOrderLink from "../../links/consignment-order"
import { assertItemsFulfillableStep } from "./steps/assert-items-fulfillable"
import { createConsignmentsStep } from "./steps/create-consignments"
import { groupVendorItemsStep } from "./steps/group-vendor-items"
import { resolveConsignmentsStep } from "./steps/resolve-consignments"

export type CreateConsignmentsWorkflowInput = {
  cart_id: string
}

// One real order, always — completeCartWorkflow already gives us correct
// payment, promotions, tax and totals for it. Vendor scoping is a
// consignment per vendor, linked to that same order and its own line items,
// never a second order: see docs/spikes/multi-vendor-order.md for why the
// earlier parent+child-order design kept breaking (missing reservations,
// stripped promotions, cancel not refunding the payment).
export const createConsignmentsWorkflow = createWorkflow(
  "create-consignments",
  function (input: CreateConsignmentsWorkflowInput) {
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
    // is a pragmatic margin against real DB latency, not a full fix.
    acquireLockStep({
      key: input.cart_id,
      timeout: 2,
      ttl: 60,
    })

    const { id: orderId } = completeCartWorkflow.runAsStep({
      input: { id: input.cart_id },
    })

    // A single idempotency check is enough here — unlike the earlier
    // parent+child design, there's only one linking mechanism (the
    // consignment-order link), not two.
    const { data: existingLinks } = useQueryGraphStep({
      entity: consignmentOrderLink.entryPoint,
      fields: ["consignment.id"],
      filters: { order_id: orderId },
    }).config({ name: "retrieve-existing-consignment-links" })

    const order = getOrderDetailWorkflow.runAsStep({
      input: {
        order_id: orderId,
        // shipping_address.country_code is for the storefront's own
        // redirect after this route responds (POST .../complete-vendor),
        // not used internally here — see placeOrder in the storefront's
        // cart.ts.
        fields: ["items.id", "items.product_id", "shipping_address.country_code"],
      },
    })

    when(
      "create-consignments",
      { existingLinks },
      (data) => data.existingLinks.length === 0,
    ).then(() => {
      const orderItems = transform({ order }, (data) =>
        (data.order.items ?? []).filter(
          (item): item is NonNullable<typeof item> => item != null,
        ),
      )

      const { vendorsItems } = groupVendorItemsStep({ items: orderItems })

      const { linkDefs } = createConsignmentsStep({
        orderId,
        vendorsItems,
      })

      createRemoteLinkStep(linkDefs)
    })

    // Runs regardless of whether the block above just created the
    // consignments or they already existed from an earlier attempt.
    const consignments = resolveConsignmentsStep({ orderId })

    releaseLockStep({ key: input.cart_id })

    return new WorkflowResponse({ order, consignments })
  },
)

export default createConsignmentsWorkflow
