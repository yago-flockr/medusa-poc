import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import type { GetVendorsOrdersResponse } from "@dtc/api-contracts/vendor/orders"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { listConsignmentsStep } from "./steps/list-consignments"
import { buildOrderList } from "./mappers/build-order-list"
import { sumVendorEarningsStep } from "./steps/sum-vendor-earnings"

export type ListVendorConsignmentsWorkflowInput = {
  actorId: string
  limit: number
  offset: number
}

export const listVendorConsignmentsWorkflow = createWorkflow(
  "list-vendor-consignments",
  function (input: ListVendorConsignmentsWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    const earningsTotals = sumVendorEarningsStep({
      vendorId: resolveVendorUser.vendorId,
    })

    const listConsignments = listConsignmentsStep({
      vendorId: resolveVendorUser.vendorId,
      limit: input.limit,
      offset: input.offset,
    })

    const response = transform(
      { listConsignments, earningsTotals, input },
      (data): GetVendorsOrdersResponse => {
        const orders = buildOrderList(data.listConsignments.consignments)

        return {
          orders,
          earnings_totals: data.earningsTotals,
          count: data.listConsignments.count,
          limit: data.input.limit,
          offset: data.input.offset,
        }
      },
    )

    return new WorkflowResponse(response)
  },
)
