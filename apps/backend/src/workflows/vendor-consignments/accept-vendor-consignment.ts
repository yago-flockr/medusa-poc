import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { setConsignmentStatusStep } from "./steps/set-consignment-status"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { resolveOwnedConsignmentStep } from "./steps/resolve-owned-consignment"
import { assertConsignmentStatusStep } from "./steps/assert-consignment-status"
import { getConsignmentOrderStep } from "./steps/get-consignment-order"
import { buildConsignmentDetail } from "./mappers/build-consignment-detail"

export type AcceptVendorConsignmentWorkflowInput = {
  actorId: string
  id: string
}

export const acceptVendorConsignmentWorkflow = createWorkflow(
  "accept-vendor-consignment",
  function (input: AcceptVendorConsignmentWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    const resolveOwnedConsignment = resolveOwnedConsignmentStep({
      consignmentId: input.id,
      vendorId: resolveVendorUser.vendorId,
    })

    assertConsignmentStatusStep({
      status: resolveOwnedConsignment.status,
      expectedStatus: "placed",
      notAllowedMessage: "This order has already been accepted.",
    })

    setConsignmentStatusStep({ consignmentId: input.id, status: "accepted" })

    const getConsignmentOrder = getConsignmentOrderStep({
      orderId: resolveOwnedConsignment.orderId,
    })

    const response = transform({ input, getConsignmentOrder }, (data) =>
      buildConsignmentDetail({
        consignmentId: data.input.id,
        consignmentStatus: "accepted",
        order: data.getConsignmentOrder,
      }),
    )

    return new WorkflowResponse(response)
  },
)
