import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaRequest } from "@medusajs/framework/http"

export type ListVendorUsersStepInput = {
  filters: MedusaRequest["filterableFields"]
  queryConfig: MedusaRequest["queryConfig"]
}

export const listVendorUsersStep = createStep(
  "list-vendor-users",
  async ({ filters, queryConfig }: ListVendorUsersStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: vendorUsers, metadata: { count, take, skip } = {} } =
      await query.graph({
        entity: "vendor_user",
        filters,
        ...queryConfig,
      })

    return new StepResponse({
      vendorUsers,
      count: count ?? 0,
      limit: take ?? 0,
      offset: skip ?? 0,
    })
  },
)
