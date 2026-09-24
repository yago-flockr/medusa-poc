import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { LinkDefinition } from "@medusajs/framework/types"
import { graph } from "../../../lib/query"
import { VENDOR_MODULE } from "../../../modules/vendor"
import { buildConsignmentEarnings } from "../mappers/build-consignment-earnings"
import type { VendorRoutableItem } from "./group-vendor-items"

export type CreateConsignmentsStepInput = {
  orderId: string
  vendorsItems: Record<string, VendorRoutableItem[]>
  currencyCode: string
}

export const createConsignmentsStep = createStep(
  "create-consignments",
  async (
    { orderId, vendorsItems, currencyCode }: CreateConsignmentsStepInput,
    { container },
  ) => {
    const vendorModuleService = container.resolve(VENDOR_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const vendorIds = Object.keys(vendorsItems)

    const { data: vendors } = await graph(query, {
      entity: "vendor",
      fields: ["id", "commission_rate"],
      filters: { id: vendorIds },
    })

    const commissionRateByVendorId = new Map(
      vendors.map((vendor) => [vendor.id, Number(vendor.commission_rate ?? 0)]),
    )

    const createdConsignments = await vendorModuleService.createConsignments(
      vendorIds.map((vendorId) => ({
        vendor_id: vendorId,
        status: "placed" as const,
        currency_code: currencyCode,
        ...buildConsignmentEarnings(
          vendorsItems[vendorId],
          commissionRateByVendorId.get(vendorId) ?? 0,
        ),
      })),
    )

    const linkDefs: LinkDefinition[] = []

    createdConsignments.forEach((consignment, index) => {
      const vendorId = vendorIds[index]

      linkDefs.push({
        [VENDOR_MODULE]: { consignment_id: consignment.id },
        [Modules.ORDER]: { order_id: orderId },
      })

      for (const item of vendorsItems[vendorId]) {
        linkDefs.push({
          [Modules.ORDER]: { order_line_item_id: item.id },
          [VENDOR_MODULE]: { consignment_id: consignment.id },
        })
      }
    })

    return new StepResponse(
      {
        consignments: createdConsignments.map((consignment, index) => ({
          ...consignment,
          vendor_id: vendorIds[index],
        })),
        linkDefs,
      },
      {
        consignmentIds: createdConsignments.map(
          (consignment) => consignment.id,
        ),
      },
    )
  },
  async (compensation, { container }) => {
    if (!compensation?.consignmentIds?.length) {
      return
    }

    const vendorModuleService = container.resolve(VENDOR_MODULE)
    await vendorModuleService.deleteConsignments(compensation.consignmentIds)
  },
)
