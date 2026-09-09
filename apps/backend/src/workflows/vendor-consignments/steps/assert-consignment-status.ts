import { createStep } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import type { VendorConsignmentStatus } from "@dtc/api-contracts/vendor/orders"

export type AssertConsignmentStatusStepInput = {
  status: VendorConsignmentStatus
  expectedStatus: VendorConsignmentStatus
  notAllowedMessage: string
}

export const assertConsignmentStatusStep = createStep(
  "assert-consignment-status",
  async ({
    status,
    expectedStatus,
    notAllowedMessage,
  }: AssertConsignmentStatusStepInput) => {
    if (status !== expectedStatus) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, notAllowedMessage)
    }
  },
)
