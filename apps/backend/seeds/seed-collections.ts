import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createCollectionsWorkflow } from "@medusajs/medusa/core-flows"
import { graph } from "../src/lib/query"
import { updateStorefrontContentWorkflow } from "../src/workflows/shared/update-storefront-content"
import { SEED_CONFIG } from "./seed-config"
import { buildSeedPlan } from "./seed-plan"

export default async function seedCollections({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  for (const fixture of buildSeedPlan(SEED_CONFIG).collections) {
    const { data: existing } = await graph(query, {
      entity: "product_collection",
      fields: ["id"],
      filters: { handle: fixture.handle },
    })

    let collectionId = existing[0]?.id

    if (collectionId) {
      logger.info(`Collection "${fixture.title}" already exists, skipping.`)
    } else {
      const { result } = await createCollectionsWorkflow(container).run({
        input: {
          collections: [{ title: fixture.title, handle: fixture.handle }],
        },
      })
      collectionId = result[0].id
      logger.info(`Created collection "${fixture.title}".`)
    }

    await updateStorefrontContentWorkflow(container).run({
      input: {
        linkModuleKey: Modules.PRODUCT,
        linkIdField: "product_collection_id",
        queryEntity: "product_collection",
        entityId: collectionId,
        name: fixture.title,
        description: fixture.description,
        hero_image_url: fixture.heroImageUrl,
      },
    })
  }

  logger.info("Finished seeding collections.")
}
