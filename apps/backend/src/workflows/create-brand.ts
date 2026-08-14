import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { toHandle } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../modules/brand"
import BrandModuleService from "../modules/brand/service"

export type CreateBrandWorkflowInput = {
  name: string
  handle?: string
}

export const createBrandStep = createStep(
  "create-brand",
  async (input: CreateBrandWorkflowInput, { container }) => {
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE)

    const brand = await brandModuleService.createBrands({
      name: input.name,
      handle: input.handle ?? toHandle(input.name),
    })

    return new StepResponse(brand, brand.id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) {
      return
    }

    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE)

    await brandModuleService.deleteBrands(id)
  },
)

export const createBrandWorkflow = createWorkflow(
  "create-brand",
  function (input: CreateBrandWorkflowInput) {
    const brand = createBrandStep(input)

    return new WorkflowResponse(brand)
  },
)
