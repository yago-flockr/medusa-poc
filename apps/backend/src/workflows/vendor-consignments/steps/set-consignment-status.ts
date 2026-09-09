import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { VENDOR_MODULE } from "../../../modules/vendor"
import type { VendorConsignmentStatus } from "@dtc/api-contracts/vendor/orders"

export type SetConsignmentStatusStepInput = {
  consignmentId: string
  status: VendorConsignmentStatus
}

type SetConsignmentStatusCompensation = {
  consignmentId: string
  previousStatus: VendorConsignmentStatus
}

export const setConsignmentStatusStep = createStep(
  "set-consignment-status",
  async (
    { consignmentId, status }: SetConsignmentStatusStepInput,
    { container },
  ) => {
    const vendorModuleService = container.resolve(VENDOR_MODULE)
    const consignment =
      await vendorModuleService.retrieveConsignment(consignmentId)
    const previousStatus = consignment.status as VendorConsignmentStatus

    const updated = await vendorModuleService.updateConsignments({
      id: consignmentId,
      status,
    })

    return new StepResponse(updated, { consignmentId, previousStatus })
  },
  async (
    compensation: SetConsignmentStatusCompensation | undefined,
    { container },
  ) => {
    if (!compensation) {
      return
    }

    const vendorModuleService = container.resolve(VENDOR_MODULE)
    await vendorModuleService.updateConsignments({
      id: compensation.consignmentId,
      status: compensation.previousStatus,
    })
  },
)
