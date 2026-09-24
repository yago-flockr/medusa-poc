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
import { DEFAULT_COUNTRY_CODE } from "../src/lib/markets"

type OrderFixture = {
  email: string
  vendorHandles: string[]
  quantity: number
  affiliateHandle?: string
}

const ORDER_FIXTURES: OrderFixture[] = [
  {
    email: "ana@example.com",
    vendorHandles: ["asd-apparel", "zxc-threads"],
    quantity: 1,
  },
  { email: "bruno@example.com", vendorHandles: ["asd-apparel"], quantity: 2 },
  {
    email: "carla@example.com",
    vendorHandles: ["zxc-threads"],
    quantity: 3,
    affiliateHandle: "qwe-creators",
  },
]

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

  for (const fixture of ORDER_FIXTURES) {
    const variantIds: string[] = []

    for (const vendorHandle of fixture.vendorHandles) {
      const { data: vendors } = await graph(query, {
        entity: "vendor",
        fields: [
          "id",
          "products.id",
          "products.status",
          "products.variants.id",
        ],
        filters: { handle: vendorHandle },
      })

      const product = (vendors[0]?.products ?? []).find(
        (candidate) => candidate?.status === "published",
      )
      const variantId = product?.variants?.[0]?.id

      if (!variantId) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `No published product for vendor "${vendorHandle}"`,
        )
      }

      variantIds.push(variantId)
    }

    const { result: cart } = await createCartWorkflow(container).run({
      input: {
        region_id: region.id,
        sales_channel_id: salesChannelId,
        email: fixture.email,
        currency_code: region.currency_code,
        shipping_address: {
          first_name: fixture.email.split("@")[0],
          last_name: "Demo",
          address_1: "1 Demo Street",
          city: "London",
          country_code: DEFAULT_COUNTRY_CODE,
          postal_code: "E1 6AN",
        },
        metadata: fixture.affiliateHandle
          ? { affiliate_handle: fixture.affiliateHandle }
          : undefined,
      },
    })

    await addToCartWorkflow(container).run({
      input: {
        cart_id: cart.id,
        items: variantIds.map((variantId) => ({
          variant_id: variantId,
          quantity: fixture.quantity,
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
      `Seeded order for ${fixture.email} across ${fixture.vendorHandles.join(", ")}${
        fixture.affiliateHandle ? ` via "${fixture.affiliateHandle}"` : ""
      } (${result.consignments.length} consignments).`,
    )
  }

  logger.info("Finished seeding demo orders.")
}
