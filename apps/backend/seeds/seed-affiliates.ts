import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createAffiliateWorkflow } from "../src/workflows/affiliates/create-affiliate"
import { promoteAffiliateProductWorkflow } from "../src/workflows/affiliate-products/promote-affiliate-product"

type AffiliateFixture = {
  name: string
  email: string
  password: string
  commissionRate: number
  promotedProductTitles: string[]
}

const AFFILIATE_FIXTURES: AffiliateFixture[] = [
  {
    name: "Qwe Creators",
    email: "qwe@qwe.com",
    password: "qwe",
    commissionRate: 0.1,
    promotedProductTitles: ["Classic Tee"],
  },
]

export default async function seedAffiliates({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  for (const fixture of AFFILIATE_FIXTURES) {
    const { data: existing } = await query.graph({
      entity: "affiliate",
      fields: ["id", "handle"],
      filters: { email: fixture.email },
    })

    let affiliateId = existing[0]?.id

    if (affiliateId) {
      logger.info(
        `Affiliate "${fixture.email}" already exists, skipping — password is the fixed "${fixture.password}" from AFFILIATE_FIXTURES.`,
      )
    } else {
      const { result } = await createAffiliateWorkflow(container).run({
        input: {
          name: fixture.name,
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
      fields: ["id", "products.id"],
      filters: { id: affiliateId },
    })
    const promotedIds = new Set(
      (promoted[0]?.products ?? []).map((product) => product?.id),
    )

    for (const title of fixture.promotedProductTitles) {
      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "title"],
        filters: { title },
      })

      const product = products[0]

      if (!product) {
        logger.warn(
          `Product "${title}" not found — run seed:vendors before seed:affiliates.`,
        )
        continue
      }

      if (promotedIds.has(product.id)) {
        logger.info(`"${fixture.name}" already promotes "${title}", skipping.`)
        continue
      }

      await promoteAffiliateProductWorkflow(container).run({
        input: { affiliateId, productId: product.id },
      })
      logger.info(`"${fixture.name}" now promotes "${title}".`)
    }
  }
}
