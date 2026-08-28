import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"

export type UpsertVendorIntegrationConnectionStepInput = {
  vendor_id: string
  provider: string
  external_account_identifier?: string | null
  client_id?: string | null
  client_secret?: string
  access_token?: string
  scope?: string
  connected_at?: Date
  oauth_state?: string | null
}

type ConnectionCompensation =
  | { existed: false; id: string }
  | { existed: true; id: string; previous: Record<string, unknown> }

export const upsertVendorIntegrationConnectionStep = createStep(
  "upsert-vendor-integration-connection",
  async (input: UpsertVendorIntegrationConnectionStepInput, { container }) => {
    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    const { vendor_id, provider, ...fields } = input
    const updatableFields = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined),
    )

    const [existing] = await vendorModuleService.listVendorIntegrationConnections({
      vendor_id,
      provider,
    })

    if (!existing) {
      const created = await vendorModuleService.createVendorIntegrationConnections({
        vendor_id,
        provider,
        ...updatableFields,
      })

      return new StepResponse(created, {
        existed: false,
        id: created.id,
      } satisfies ConnectionCompensation)
    }

    const previous = Object.fromEntries(
      Object.keys(updatableFields).map((field) => [
        field,
        (existing as unknown as Record<string, unknown>)[field],
      ]),
    )

    const updated = await vendorModuleService.updateVendorIntegrationConnections({
      id: existing.id,
      ...updatableFields,
    })

    return new StepResponse(updated, {
      existed: true,
      id: existing.id,
      previous,
    } satisfies ConnectionCompensation)
  },
  async (compensation: ConnectionCompensation | undefined, { container }) => {
    if (!compensation) {
      return
    }

    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)

    if (!compensation.existed) {
      await vendorModuleService.deleteVendorIntegrationConnections(compensation.id)
      return
    }

    await vendorModuleService.updateVendorIntegrationConnections({
      id: compensation.id,
      ...compensation.previous,
    })
  },
)
