import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { VENDOR_MODULE } from "../../../modules/vendor"
import type VendorModuleService from "../../../modules/vendor/service"

export type AssertIntegrationAccountAvailableStepInput = {
  vendor_id: string
  provider: string
  external_account_identifier?: string | null
}

export const assertIntegrationAccountAvailableStep = createStep(
  "assert-integration-account-available",
  async (input: AssertIntegrationAccountAvailableStepInput, { container }) => {
    if (!input.external_account_identifier) {
      return new StepResponse(true)
    }

    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    const connections =
      await vendorModuleService.listVendorIntegrationConnections({
        provider: input.provider,
        external_account_identifier: input.external_account_identifier,
      })

    if (
      connections.some((connection) => connection.vendor_id !== input.vendor_id)
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `${input.external_account_identifier} is already connected to another vendor. Each ${input.provider} store can belong to one vendor only.`,
      )
    }

    return new StepResponse(true)
  },
)
