import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateVendorStep,
  type UpdateVendorStepInput,
} from "./steps/update-vendor"
import {
  upsertVendorIntegrationConnectionStep,
  type UpsertVendorIntegrationConnectionStepInput,
} from "../shared/steps/upsert-vendor-integration-connection"

export type UpdateVendorWorkflowInput = UpdateVendorStepInput & {
  integration_connection?: Omit<
    UpsertVendorIntegrationConnectionStepInput,
    "vendor_id"
  >
}

export const updateVendorWorkflow = createWorkflow(
  "update-vendor",
  function (input: UpdateVendorWorkflowInput) {
    const vendorFields = transform({ input }, (data) => ({
      id: data.input.id,
      name: data.input.name,
      handle: data.input.handle,
      is_active: data.input.is_active,
    }))
    const vendor = updateVendorStep(vendorFields)

    const integrationConnection = when(
      "has-integration-connection-update",
      { input },
      (data) => Boolean(data.input.integration_connection),
    ).then(() => {
      const connectionInput = transform({ input }, (data) => ({
        vendor_id: data.input.id,
        ...data.input.integration_connection!,
      }))
      return upsertVendorIntegrationConnectionStep(connectionInput)
    })

    const result = transform({ vendor, integrationConnection }, (data) => ({
      vendor: data.vendor,
      integration_connection: data.integrationConnection ?? null,
    }))

    return new WorkflowResponse(result)
  },
)
