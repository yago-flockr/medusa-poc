import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createAffiliateWorkflow } from "../src/workflows/affiliates/create-affiliate"
import { promoteAffiliateProductWorkflow } from "../src/workflows/affiliate-products/promote-affiliate-product"
import { SEED_CONFIG } from "./seed-config"
import { buildSeedPlan } from "./seed-plan"

export default async function seedAffiliates({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  for (const fixture of buildSeedPlan(SEED_CONFIG).affiliates) {
    const { data: existing } = await query.graph({
      entity: "affiliate",
      fields: ["id"],
      filters: { email: fixture.email },
    })

    let affiliateId = existing[0]?.id

    if (affiliateId) {
      logger.info(`Affiliate "${fixture.email}" already exists, skipping.`)
    } else {
      const { result } = await createAffiliateWorkflow(container).run({
        input: {
          name: fixture.name,
          handle: fixture.handle,
          email: fixture.email,
          password: fixture.password,
          commission_rate: fixture.commissionRate,
        },
      })
      affiliateId = result.affiliate.id
      logger.info(
        `Affiliate login for "${fixture.name}" — email: ${result.affiliate.email}  password: ${result.password}  code: ${result.affiliate.handle}`,
      )
    }

    const { data: promoted } = await query.graph({
      entity: "affiliate",
      fields: ["products.id"],
      filters: { id: affiliateId },
    })
    const promotedIds = new Set(
      (promoted[0]?.products ?? []).map((product) => product?.id),
    )

    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      filters: { handle: fixture.productHandles },
    })

    for (const product of products) {
      if (promotedIds.has(product.id)) {
        continue
      }

      await promoteAffiliateProductWorkflow(container).run({
        input: { affiliateId, productId: product.id },
      })
    }

    logger.info(
      `"${fixture.name}" promotes ${products.length}/${fixture.productHandles.length} planned products.`,
    )
  }
}
