import type { LinkDefinition } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import type { BrandAdditionalData } from "../../api/admin/brands/additional-data"
import type { VendorAdditionalData } from "../../api/vendors/additional-data"
import { BRAND_MODULE } from "../../modules/brand"
import BrandModuleService from "../../modules/brand/service"
import { VENDOR_MODULE } from "../../modules/vendor"
import VendorModuleService from "../../modules/vendor/service"

type ProductAdditionalData = BrandAdditionalData & VendorAdditionalData

function reassignmentLinks(
  productId: string,
  moduleKey: string,
  idField: string,
  currentId: string | undefined,
  nextId: string | null,
) {
  const dismiss = currentId
    ? ({
        [Modules.PRODUCT]: { product_id: productId },
        [moduleKey]: { [idField]: currentId },
      } as LinkDefinition)
    : undefined

  const create = nextId
    ? ({
        [Modules.PRODUCT]: { product_id: productId },
        [moduleKey]: { [idField]: nextId },
      } as LinkDefinition)
    : undefined

  return { dismiss, create }
}

updateProductsWorkflow.hooks.productsUpdated(
  async ({ products, additional_data }, { container }) => {
    const data = additional_data as ProductAdditionalData | undefined

    const changesBrand = !!data && "brand_id" in data
    const changesVendor = !!data && "vendor_id" in data

    if (!changesBrand && !changesVendor) {
      return new StepResponse(
        { dismissed: [], created: [] },
        { dismissed: [], created: [] },
      )
    }

    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const nextBrandId = data?.brand_id ?? null
    const nextVendorId = data?.vendor_id ?? null

    if (changesBrand && nextBrandId) {
      const brandModuleService: BrandModuleService =
        container.resolve(BRAND_MODULE)
      await brandModuleService.retrieveBrand(nextBrandId)
    }

    if (changesVendor && nextVendorId) {
      const vendorModuleService: VendorModuleService =
        container.resolve(VENDOR_MODULE)
      await vendorModuleService.retrieveVendor(nextVendorId)
    }

    const dismissed: LinkDefinition[] = []
    const created: LinkDefinition[] = []

    for (const product of products) {
      const {
        data: [existing],
      } = await query.graph({
        entity: "product",
        filters: { id: product.id },
        fields: ["id", "brand.id", "vendor.id"],
      })

      const existingProduct = existing as {
        brand?: { id: string } | null
        vendor?: { id: string } | null
      }

      if (changesBrand && existingProduct?.brand?.id !== nextBrandId) {
        const { dismiss, create } = reassignmentLinks(
          product.id,
          BRAND_MODULE,
          "brand_id",
          existingProduct?.brand?.id,
          nextBrandId,
        )
        if (dismiss) dismissed.push(dismiss)
        if (create) created.push(create)
      }

      if (changesVendor && existingProduct?.vendor?.id !== nextVendorId) {
        const { dismiss, create } = reassignmentLinks(
          product.id,
          VENDOR_MODULE,
          "vendor_id",
          existingProduct?.vendor?.id,
          nextVendorId,
        )
        if (dismiss) dismissed.push(dismiss)
        if (create) created.push(create)
      }
    }

    if (dismissed.length) {
      await link.dismiss(dismissed)
    }

    if (created.length) {
      await link.create(created)
    }

    return new StepResponse({ dismissed, created }, { dismissed, created })
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }

    const { dismissed = [], created = [] } = compensation as {
      dismissed?: LinkDefinition[]
      created?: LinkDefinition[]
    }

    const link = container.resolve(ContainerRegistrationKeys.LINK)

    if (created.length) {
      await link.dismiss(created)
    }

    if (dismissed.length) {
      await link.create(dismissed)
    }
  },
)
