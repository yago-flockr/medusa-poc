import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import type { VendorConsignmentStatus } from "@dtc/api-contracts/vendor/orders"

export type SetVendorOrderConsignmentStatusStepInput = {
  orderId: string
  status: VendorConsignmentStatus
}

type SetVendorOrderConsignmentStatusCompensation = {
  orderId: string
  previousMetadata: Record<string, unknown> | null
}

export const setVendorOrderConsignmentStatusStep = createStep(
  "set-vendor-order-consignment-status",
  async (
    input: SetVendorOrderConsignmentStatusStepInput,
    { container },
  ) => {
    const orderModuleService = container.resolve(Modules.ORDER)
    const order = await orderModuleService.retrieveOrder(input.orderId)
    const previousMetadata = order.metadata ?? null

    await orderModuleService.updateOrders(input.orderId, {
      metadata: { ...previousMetadata, consignment_status: input.status },
    })

    return new StepResponse(
      { orderId: input.orderId, status: input.status },
      { orderId: input.orderId, previousMetadata },
    )
  },
  async (
    compensation: SetVendorOrderConsignmentStatusCompensation | undefined,
    { container },
  ) => {
    if (!compensation) {
      return
    }

    const orderModuleService = container.resolve(Modules.ORDER)
    await orderModuleService.updateOrders(compensation.orderId, {
      metadata: compensation.previousMetadata,
    })
  },
)
