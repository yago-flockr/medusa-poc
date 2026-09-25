import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"
import { graph } from "../src/lib/query"
import { updateStorefrontContentWorkflow } from "../src/workflows/shared/update-storefront-content"
import { SEED_CONFIG } from "./seed-config"
import { buildSeedPlan } from "./seed-plan"

export default async function seedCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  for (const fixture of buildSeedPlan(SEED_CONFIG).categories) {
    const { data: existing } = await graph(query, {
      entity: "product_category",
      fields: ["id"],
      filters: { handle: fixture.handle },
    })

    let categoryId = existing[0]?.id

    if (categoryId) {
      logger.info(`Category "${fixture.name}" already exists, skipping.`)
    } else {
      const { result } = await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: [
            {
              name: fixture.name,
              handle: fixture.handle,
              is_active: true,
              is_internal: false,
            },
          ],
        },
      })
      categoryId = result[0].id
      logger.info(`Created category "${fixture.name}".`)
    }

    await updateStorefrontContentWorkflow(container).run({
      input: {
        linkModuleKey: Modules.PRODUCT,
        linkIdField: "product_category_id",
        queryEntity: "product_category",
        entityId: categoryId,
        name: fixture.name,
        description: fixture.description,
        hero_image_url: fixture.heroImageUrl,
      },
    })
  }

  logger.info("Finished seeding categories.")
}
