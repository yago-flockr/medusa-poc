import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { LinkDefinition } from "@medusajs/framework/types"
import type { BrandAdditionalData } from "../../api/admin/brands/additional-data"
import { BRAND_MODULE } from "../../modules/brand"
import BrandModuleService from "../../modules/brand/service"

createProductsWorkflow.hooks.productsCreated(
  async ({ products, additional_data }, { container }) => {
    const brandData = additional_data as BrandAdditionalData | undefined

    if (!brandData?.brand_id) {
      return new StepResponse([], [])
    }

    const brandModuleService: BrandModuleService = container.resolve(
      BRAND_MODULE
    )

    await brandModuleService.retrieveBrand(brandData.brand_id)

    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const links: LinkDefinition[] = []

    for (const product of products) {
      links.push({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [BRAND_MODULE]: {
          brand_id: brandData.brand_id,
        },
      })
    }

    await link.create(links)

    return new StepResponse(links, links)
  },
  async (links, { container }) => {
    if (!links?.length) {
      return
    }

    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.dismiss(links)
  }
)
