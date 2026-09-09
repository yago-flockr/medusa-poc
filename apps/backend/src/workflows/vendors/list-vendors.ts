import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  listVendorsStep,
  type ListVendorsStepInput,
} from "./steps/list-vendors"
import { buildVendor } from "./mappers/build-vendor"

export type ListVendorsWorkflowInput = ListVendorsStepInput

export const listVendorsWorkflow = createWorkflow(
  "list-vendors",
  function (input: ListVendorsWorkflowInput) {
    const result = listVendorsStep(input)
    const response = transform({ result }, (data) => ({
      vendors: data.result.vendors.map(buildVendor),
      count: data.result.count,
      limit: data.result.limit,
      offset: data.result.offset,
    }))

    return new WorkflowResponse(response)
  },
)
