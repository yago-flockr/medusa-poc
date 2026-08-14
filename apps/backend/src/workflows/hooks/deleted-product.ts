import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { LinkDefinition } from "@medusajs/framework/types"
import { BRAND_MODULE } from "../../modules/brand"

// deleteCascade on the product-brand link would delete the shared brand
// itself whenever one of its products is deleted, which is wrong for a
// many-products-to-one-brand relationship. So the link is dismissed here
// explicitly instead, leaving the brand record untouched.
deleteProductsWorkflow.hooks.productsDeleted(
  async ({ ids }, { container }) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)

    const links = (await link.list(
      {
        [Modules.PRODUCT]: { product_id: ids },
        [BRAND_MODULE]: {},
      },
      { asLinkDefinition: true }
    )) as LinkDefinition[]

    if (!links.length) {
      return new StepResponse([], [])
    }

    await link.dismiss(links)

    return new StepResponse(links, links)
  },
  async (links, { container }) => {
    if (!links?.length) {
      return
    }

    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.create(links)
  }
)
