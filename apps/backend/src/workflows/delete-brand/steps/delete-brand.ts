import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { LinkDefinition } from "@medusajs/framework/types"
import { BRAND_MODULE } from "../../../modules/brand"
import BrandModuleService from "../../../modules/brand/service"

export type DeleteBrandStepInput = {
  id: string
}

type DeleteBrandCompensation = {
  id: string
  links: LinkDefinition[]
}

export const deleteBrandStep = createStep(
  "delete-brand",
  async (input: DeleteBrandStepInput, { container }) => {
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const link = container.resolve(ContainerRegistrationKeys.LINK)

    await brandModuleService.retrieveBrand(input.id)

    const { data: brands } = await query.graph({
      entity: "brand",
      filters: { id: input.id },
      fields: ["id", "products.id"],
    })

    const brand = brands[0]
    const products = (brand?.products ?? []) as { id: string }[]
    const links: LinkDefinition[] = products.map((product) => ({
      [Modules.PRODUCT]: {
        product_id: product.id,
      },
      [BRAND_MODULE]: {
        brand_id: input.id,
      },
    }))

    if (links.length) {
      await link.dismiss(links)
    }

    await brandModuleService.softDeleteBrands(input.id)

    return new StepResponse({ id: input.id }, {
      id: input.id,
      links,
    } satisfies DeleteBrandCompensation)
  },
  async (compensation: DeleteBrandCompensation | undefined, { container }) => {
    if (!compensation) {
      return
    }

    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE)
    const link = container.resolve(ContainerRegistrationKeys.LINK)

    await brandModuleService.restoreBrands(compensation.id)

    if (compensation.links.length) {
      await link.create(compensation.links)
    }
  },
)
