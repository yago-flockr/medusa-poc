import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import type { LinkDefinition } from "@medusajs/framework/types"
import { VENDOR_MODULE } from "../../../modules/vendor"
import type { VendorRoutableItem } from "./group-vendor-items"

export type CreateConsignmentsStepInput = {
  orderId: string
  vendorsItems: Record<string, VendorRoutableItem[]>
}

export const createConsignmentsStep = createStep(
  "create-consignments",
  async (
    { orderId, vendorsItems }: CreateConsignmentsStepInput,
    { container },
  ) => {
    const vendorModuleService = container.resolve(VENDOR_MODULE)
    const vendorIds = Object.keys(vendorsItems)

    const createdConsignments = await vendorModuleService.createConsignments(
      vendorIds.map((vendorId) => ({
        vendor_id: vendorId,
        status: "placed" as const,
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
