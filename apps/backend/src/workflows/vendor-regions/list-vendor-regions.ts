import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import type { GetVendorsRegionsResponse } from "@dtc/api-contracts/vendor/regions"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { listRegionsStep } from "./steps/list-regions"
import { buildCountries } from "./mappers/build-countries"

export type ListVendorRegionsWorkflowInput = {
  actorId: string
}

export const listVendorRegionsWorkflow = createWorkflow(
  "list-vendor-regions",
  function (input: ListVendorRegionsWorkflowInput) {
    resolveVendorUserStep({ actorId: input.actorId })

    const listRegions = listRegionsStep()

    const response = transform(
      { listRegions },
      (data): GetVendorsRegionsResponse => ({
        countries: buildCountries(data.listRegions),
      }),
    )

    return new WorkflowResponse(response)
  },
)
