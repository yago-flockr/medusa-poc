import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  addShippingMethodToCartWorkflow,
  addToCartWorkflow,
  createCartWorkflow,
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { graph } from "../src/lib/query"
import { createConsignmentsWorkflow } from "../src/workflows/create-consignments/create-consignments"
import { listVendorShippingOptionsWorkflow } from "../src/workflows/vendor-shipping-options/list-vendor-shipping-options"
import { SEED_CONFIG } from "./seed-config"
import { buildSeedPlan } from "./seed-plan"

export default async function seedOrders({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: existingConsignments } = await graph(query, {
    entity: "consignment",
    fields: ["id"],
  })

  if (existingConsignments.length > 0) {
    logger.info("Orders already seeded, skipping.")
    return
  }

  const { data: regions } = await graph(query, {
    entity: "region",
    fields: ["id", "currency_code"],
  })
  const region = regions[0]

  const { data: stores } = await graph(query, {
    entity: "store",
    fields: ["default_sales_channel_id"],
  })
  const salesChannelId = stores[0]?.default_sales_channel_id

  if (!region || !salesChannelId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Run seed:catalog before seeding orders",
    )
  }

  for (const fixture of buildSeedPlan(SEED_CONFIG).orders) {
    const skus = fixture.items.map((item) => item.sku)
    const { data: variants } = await graph(query, {
      entity: "product_variant",
      fields: ["id", "sku"],
      filters: { sku: skus },
    })
    const variantIdBySku = new Map(
      variants.map((variant) => [variant.sku, variant.id]),
    )
    const missing = skus.filter((sku) => !variantIdBySku.has(sku))

    if (missing.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Run seed:vendors before seed:orders — missing variants: ${missing.join(", ")}`,
      )
    }

    const { result: cart } = await createCartWorkflow(container).run({
      input: {
        region_id: region.id,
        sales_channel_id: salesChannelId,
        email: fixture.email,
        currency_code: region.currency_code,
        shipping_address: {
          first_name: fixture.firstName,
          last_name: fixture.lastName,
          ...fixture.address,
        },
        metadata: fixture.affiliateHandle
          ? { affiliate_handle: fixture.affiliateHandle }
          : undefined,
      },
    })

    await addToCartWorkflow(container).run({
      input: {
        cart_id: cart.id,
        items: fixture.items.map((item) => ({
          variant_id: variantIdBySku.get(item.sku)!,
          quantity: item.quantity,
        })),
      },
    })

    const { result: shippingOptions } = await listVendorShippingOptionsWorkflow(
      container,
    ).run({ input: { cartId: cart.id } })

    for (const option of shippingOptions.shipping_options) {
      await addShippingMethodToCartWorkflow(container).run({
        input: { cart_id: cart.id, options: [{ id: option.id }] },
      })
    }

    const { result: paymentCollection } =
      await createPaymentCollectionForCartWorkflow(container).run({
        input: { cart_id: cart.id },
      })

    await createPaymentSessionsWorkflow(container).run({
      input: {
        payment_collection_id: paymentCollection.id,
        provider_id: "pp_system_default",
      },
    })

    const { result } = await createConsignmentsWorkflow(container).run({
      input: { cart_id: cart.id },
    })

    logger.info(
      `Seeded order for ${fixture.email} with ${fixture.items.length} items${
        fixture.affiliateHandle ? ` via "${fixture.affiliateHandle}"` : ""
      } (${result.consignments.length} consignments).`,
    )
  }

  logger.info("Finished seeding demo orders.")
}
