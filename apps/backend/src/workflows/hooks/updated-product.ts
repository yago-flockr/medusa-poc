import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import type { LinkDefinition } from "@medusajs/framework/types"
import { BRAND_MODULE } from "../../modules/brand"
import BrandModuleService from "../../modules/brand/service"

updateProductsWorkflow.hooks.productsUpdated(
  async ({ products, additional_data }, { container }) => {
    if (!additional_data || !("brand_id" in additional_data)) {
      return new StepResponse(
        { dismissed: [], created: [] },
        { dismissed: [], created: [] }
      )
    }

    const brandId = additional_data.brand_id as string | null
    const link = container.resolve("link")
    const query = container.resolve("query")

    if (brandId) {
      const brandModuleService: BrandModuleService = container.resolve(
        BRAND_MODULE
      )
      await brandModuleService.retrieveBrand(brandId)
    }

    const dismissed: LinkDefinition[] = []
    const created: LinkDefinition[] = []

    for (const product of products) {
      const {
        data: [existing],
      } = await query.graph({
        entity: "product",
        filters: { id: product.id },
        fields: ["id", "brand.id"],
      })

      const currentBrandId = (existing as { brand?: { id: string } | null })
        ?.brand?.id

      if (currentBrandId === brandId) {
        continue
      }

      if (currentBrandId) {
        const existingLink: LinkDefinition = {
          [Modules.PRODUCT]: {
            product_id: product.id,
          },
          [BRAND_MODULE]: {
            brand_id: currentBrandId,
          },
        }
        await link.dismiss([existingLink])
        dismissed.push(existingLink)
      }

      if (brandId) {
        const nextLink: LinkDefinition = {
          [Modules.PRODUCT]: {
            product_id: product.id,
          },
          [BRAND_MODULE]: {
            brand_id: brandId,
          },
        }
        await link.create([nextLink])
        created.push(nextLink)
      }
    }

    return new StepResponse(
      { dismissed, created },
      { dismissed, created }
    )
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }

    const { dismissed = [], created = [] } = compensation as {
      dismissed?: LinkDefinition[]
      created?: LinkDefinition[]
    }

    const link = container.resolve("link")

    if (created.length) {
      await link.dismiss(created)
    }

    if (dismissed.length) {
      await link.create(dismissed)
    }
  }
)
