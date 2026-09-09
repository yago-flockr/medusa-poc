import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createOrderFulfillmentWorkflow,
  createOrderShipmentWorkflow,
} from "@medusajs/medusa/core-flows"
import { setConsignmentStatusStep } from "./steps/set-consignment-status"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { resolveOwnedConsignmentStep } from "./steps/resolve-owned-consignment"
import { assertConsignmentStatusStep } from "./steps/assert-consignment-status"
import { resolveConsignmentItemsStep } from "./steps/resolve-consignment-items"
import { resolveVendorShippingOptionStep } from "./steps/resolve-vendor-shipping-option"
import { getConsignmentOrderStep } from "./steps/get-consignment-order"
import { buildShipmentInput } from "./mappers/build-shipment-input"
import { buildConsignmentDetail } from "./mappers/build-consignment-detail"

export type DispatchVendorConsignmentWorkflowInput = {
  actorId: string
  id: string
  trackingNumber: string
  trackingUrl?: string
}

export const dispatchVendorConsignmentWorkflow = createWorkflow(
  "dispatch-vendor-consignment",
  function (input: DispatchVendorConsignmentWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    const resolveOwnedConsignment = resolveOwnedConsignmentStep({
      consignmentId: input.id,
      vendorId: resolveVendorUser.vendorId,
    })

    assertConsignmentStatusStep({
      status: resolveOwnedConsignment.status,
      expectedStatus: "accepted",
      notAllowedMessage: "Accept this order before dispatching it.",
    })

    const resolveConsignmentItems = resolveConsignmentItemsStep({
      consignmentId: input.id,
    })

    const resolveVendorShippingOption = resolveVendorShippingOptionStep({
      orderId: resolveOwnedConsignment.orderId,
      vendorId: resolveVendorUser.vendorId,
    })

    const createOrderFulfillment = createOrderFulfillmentWorkflow.runAsStep({
      input: {
        order_id: resolveOwnedConsignment.orderId,
        location_id: resolveVendorShippingOption.locationId,
        shipping_option_id: resolveVendorShippingOption.shippingOptionId,
        items: resolveConsignmentItems,
      },
    })

    const shipmentInput = transform(
      {
        input,
        resolveOwnedConsignment,
        resolveConsignmentItems,
        createOrderFulfillment,
      },
      (data) =>
        buildShipmentInput({
          orderId: data.resolveOwnedConsignment.orderId,
          fulfillmentId: data.createOrderFulfillment.id,
          items: data.resolveConsignmentItems,
          trackingNumber: data.input.trackingNumber,
          trackingUrl: data.input.trackingUrl,
        }),
    )

    createOrderShipmentWorkflow.runAsStep({ input: shipmentInput })

    setConsignmentStatusStep({ consignmentId: input.id, status: "dispatched" })

    const getConsignmentOrder = getConsignmentOrderStep({
      orderId: resolveOwnedConsignment.orderId,
    })

    const response = transform({ input, getConsignmentOrder }, (data) =>
      buildConsignmentDetail({
        consignmentId: data.input.id,
        consignmentStatus: "dispatched",
        order: data.getConsignmentOrder,
      }),
    )

    return new WorkflowResponse(response)
  },
)
