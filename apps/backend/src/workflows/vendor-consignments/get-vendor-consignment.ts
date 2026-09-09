import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { resolveOwnedConsignmentStep } from "./steps/resolve-owned-consignment"
import { getConsignmentOrderStep } from "./steps/get-consignment-order"
import { buildConsignmentDetail } from "./mappers/build-consignment-detail"

export type GetVendorConsignmentWorkflowInput = {
  actorId: string
  id: string
}

export const getVendorConsignmentWorkflow = createWorkflow(
  "get-vendor-consignment",
  function (input: GetVendorConsignmentWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    const resolveOwnedConsignment = resolveOwnedConsignmentStep({
      consignmentId: input.id,
      vendorId: resolveVendorUser.vendorId,
    })

    const getConsignmentOrder = getConsignmentOrderStep({
      orderId: resolveOwnedConsignment.orderId,
    })

    const response = transform(
      { input, resolveOwnedConsignment, getConsignmentOrder },
      (data) =>
        buildConsignmentDetail({
          consignmentId: data.input.id,
          consignmentStatus: data.resolveOwnedConsignment.status,
          order: data.getConsignmentOrder,
        }),
    )

    return new WorkflowResponse(response)
  },
)
