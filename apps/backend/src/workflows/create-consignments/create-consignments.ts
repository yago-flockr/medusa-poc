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
import { readCartAffiliateHandle } from "../shared/lib/cart-affiliate-handle"
import { createReferralStep } from "./steps/create-referral"
import { resolveConsignmentsStep } from "./steps/resolve-consignments"

export type CreateConsignmentsWorkflowInput = {
  cart_id: string
}

// One real order always — consignments are per-vendor links on that order,
// never a second order (see docs/spikes/multi-vendor-order.md for why).
export const createConsignmentsWorkflow = createWorkflow(
  "create-consignments",
  function (input: CreateConsignmentsWorkflowInput) {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ["id", "items.*", "metadata"],
      filters: { id: input.cart_id },
      options: { throwIfKeyNotFound: true },
    })

    const cartItems = transform({ carts }, (data) =>
      (data.carts[0].items ?? []).filter(
        (item): item is NonNullable<typeof item> => item != null,
      ),
    ) as unknown as CartLineItemDTO[]

    const affiliateHandle = transform({ carts }, (data) =>
      readCartAffiliateHandle(data.carts[0].metadata),
    )

    assertItemsFulfillableStep({ items: cartItems })

    // ttl doesn't renew, so 60s is a pragmatic margin, not a full fix.
    acquireLockStep({
      key: input.cart_id,
      timeout: 2,
      ttl: 60,
    })

    const { id: orderId } = completeCartWorkflow.runAsStep({
      input: { id: input.cart_id },
    })

    // One idempotency check suffices: only one linking mechanism exists.
    const { data: existingLinks } = useQueryGraphStep({
      entity: consignmentOrderLink.entryPoint,
      fields: ["consignment.id"],
      filters: { order_id: orderId },
    }).config({ name: "retrieve-existing-consignment-links" })

    const order = getOrderDetailWorkflow.runAsStep({
      input: {
        order_id: orderId,
        // country_code is unused here — only for the storefront's
        // post-redirect (see placeOrder in cart.ts).
        fields: [
          "items.id",
          "items.product_id",
          "shipping_address.country_code",
        ],
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

      const { linkDefs: referralLinkDefs } = createReferralStep({
        orderId,
        affiliateHandle,
      })

      const allLinkDefs = transform(
        { linkDefs, referralLinkDefs },
        (data) => [...data.linkDefs, ...data.referralLinkDefs],
      )

      createRemoteLinkStep(allLinkDefs)
    })

    // Runs regardless of whether the block above just created the
    // consignments or they already existed from an earlier attempt.
    const consignments = resolveConsignmentsStep({ orderId })

    releaseLockStep({ key: input.cart_id })

    return new WorkflowResponse({ order, consignments })
  },
)
