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
import { upsertStorefrontContentStep } from "../shared/steps/upsert-storefront-content"
import { VENDOR_MODULE } from "../../modules/vendor"

export type UpdateVendorWorkflowInput = UpdateVendorStepInput & {
  integration_connection?: Omit<
    UpsertVendorIntegrationConnectionStepInput,
    "vendor_id"
  >
  storefront_content?: {
    name?: string
    description?: string
    hero_image_url?: string
  }
}

export const updateVendorWorkflow = createWorkflow(
  "update-vendor",
  function (input: UpdateVendorWorkflowInput) {
    const vendorFields = transform({ input }, (data) => ({
      id: data.input.id,
      name: data.input.name,
      handle: data.input.handle,
      is_active: data.input.is_active,
      commission_rate: data.input.commission_rate,
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

    const storefrontContent = when(
      "has-storefront-content-update",
      { input },
      (data) => Boolean(data.input.storefront_content),
    ).then(() => {
      const storefrontContentInput = transform({ input }, (data) => ({
        linkModuleKey: VENDOR_MODULE,
        linkIdField: "vendor_id",
        queryEntity: "vendor" as const,
        entityId: data.input.id,
        ...data.input.storefront_content!,
      }))
      return upsertStorefrontContentStep(storefrontContentInput)
    })

    const result = transform(
      { vendor, integrationConnection, storefrontContent },
      (data) => ({
        vendor: data.vendor,
        integration_connection: data.integrationConnection ?? null,
        storefront_content: data.storefrontContent ?? null,
      }),
    )

    return new WorkflowResponse(result)
  },
)
