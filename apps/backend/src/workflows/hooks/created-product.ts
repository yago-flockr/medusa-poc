import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { LinkDefinition } from "@medusajs/framework/types"
import type { BrandAdditionalData } from "../../api/admin/brands/additional-data"
import type { VendorAdditionalData } from "../../api/vendors/additional-data"
import { BRAND_MODULE } from "../../modules/brand"
import BrandModuleService from "../../modules/brand/service"
import { VENDOR_MODULE } from "../../modules/vendor"
import VendorModuleService from "../../modules/vendor/service"

type ProductAdditionalData = BrandAdditionalData & VendorAdditionalData

function buildProductLinks(
  products: { id: string }[],
  moduleKey: string,
  idField: string,
  entityId: string,
): LinkDefinition[] {
  return products.map((product) => ({
    [Modules.PRODUCT]: { product_id: product.id },
    [moduleKey]: { [idField]: entityId },
  }))
}

createProductsWorkflow.hooks.productsCreated(
  async ({ products, additional_data }, { container }) => {
    const data = additional_data as ProductAdditionalData | undefined

    if (!data?.brand_id && !data?.vendor_id) {
      return new StepResponse([], [])
    }

    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const links: LinkDefinition[] = []

    if (data.brand_id) {
      const brandModuleService: BrandModuleService =
        container.resolve(BRAND_MODULE)

      await brandModuleService.retrieveBrand(data.brand_id)
      links.push(...buildProductLinks(products, BRAND_MODULE, "brand_id", data.brand_id))
    }

    if (data.vendor_id) {
      const vendorModuleService: VendorModuleService =
        container.resolve(VENDOR_MODULE)

      await vendorModuleService.retrieveVendor(data.vendor_id)
      links.push(...buildProductLinks(products, VENDOR_MODULE, "vendor_id", data.vendor_id))
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
  },
)
