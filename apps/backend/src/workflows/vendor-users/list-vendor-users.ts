import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  listVendorUsersStep,
  type ListVendorUsersStepInput,
} from "./steps/list-vendor-users"
import { buildVendorUserList } from "./mappers/build-vendor-user-list"

export type ListVendorUsersWorkflowInput = ListVendorUsersStepInput

export const listVendorUsersWorkflow = createWorkflow(
  "list-vendor-users",
  function (input: ListVendorUsersWorkflowInput) {
    const result = listVendorUsersStep(input)
    const response = transform({ result }, (data) =>
      buildVendorUserList(data.result),
    )

    return new WorkflowResponse(response)
  },
)
