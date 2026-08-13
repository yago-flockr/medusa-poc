import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"

export type UpdateBrandWorkflowInput = {
  id: string
  name?: string
  handle?: string
}

type UpdateBrandCompensation = {
  id: string
  name: string
  handle: string
}

export const updateBrandStep = createStep(
  "update-brand",
  async (input: UpdateBrandWorkflowInput, { container }) => {
    const brandModuleService: BrandModuleService = container.resolve(
      BRAND_MODULE
    )

    const existing = await brandModuleService.retrieveBrand(input.id)
    const update: { id: string; name?: string; handle?: string } = {
      id: input.id,
    }

    if (input.name !== undefined) {
      update.name = input.name
    }

    if (input.handle !== undefined) {
      update.handle = input.handle
    }

    const brand = await brandModuleService.updateBrands(update)

    return new StepResponse(brand, {
      id: existing.id,
      name: existing.name,
      handle: existing.handle,
    } satisfies UpdateBrandCompensation)
  },
  async (compensation: UpdateBrandCompensation | undefined, { container }) => {
    if (!compensation) {
      return
    }

    const brandModuleService: BrandModuleService = container.resolve(
      BRAND_MODULE
    )

    await brandModuleService.updateBrands({
      id: compensation.id,
      name: compensation.name,
      handle: compensation.handle,
    })
  }
)

export const updateBrandWorkflow = createWorkflow(
  "update-brand",
  function (input: UpdateBrandWorkflowInput) {
    const brand = updateBrandStep(input)

    return new WorkflowResponse(brand)
  }
)
