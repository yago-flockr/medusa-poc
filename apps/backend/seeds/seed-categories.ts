import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"
import { graph } from "../src/lib/query"
import { updateStorefrontContentWorkflow } from "../src/workflows/shared/update-storefront-content"

type CategoryFixture = {
  name: string
  handle: string
  description: string
  heroImageUrl: string
}

export const CATEGORY_FIXTURES: CategoryFixture[] = [
  {
    name: "T-shirts",
    handle: "t-shirts",
    description:
      "Everyday weights and garment-dyed finishes, cut for repeat wear.",
    heroImageUrl:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
  },
  {
    name: "Sweats & knits",
    handle: "sweats-and-knits",
    description:
      "Loopback sweats, merino crews and half-zips for the colder half of the year.",
    heroImageUrl:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
  },
  {
    name: "Shirts",
    handle: "shirts",
    description: "Overshirts and open-weave linen, made to be layered.",
    heroImageUrl:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
  },
  {
    name: "Shorts & trousers",
    handle: "shorts-and-trousers",
    description: "Drawcord trousers and running shorts, built to move.",
    heroImageUrl:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
  },
]

export default async function seedCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  for (const fixture of CATEGORY_FIXTURES) {
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
