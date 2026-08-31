import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  ProductStatus,
  toHandle,
} from "@medusajs/framework/utils"
import { faker } from "@faker-js/faker"
import { createVendorWorkflow } from "../src/workflows/create-vendor"
import { createVendorUserWorkflow } from "../src/workflows/create-vendor-user"
import { createVendorProductWorkflow } from "../src/workflows/create-vendor-product"
import { resolveStorePrerequisites } from "../src/lib/resolve-store-prerequisites"
import {
  resolveProductVariants,
  type VendorVariantInput,
} from "../src/api/vendors/products/build-variants"

type ProductFixture = {
  title: string
  description: string
  optionTitle: string
  optionValues: string[]
  basePrice: number
  images: string[]
}

type VendorFixture = {
  name: string
  handle: string
  email: string
  firstName: string
  products: ProductFixture[]
}

const TEE_IMAGES = [
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
]
const SWEATSHIRT_IMAGES = [
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
]
const SHORTS_IMAGES = [
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png",
]
const IMAGE_SETS = [TEE_IMAGES, SWEATSHIRT_IMAGES, SHORTS_IMAGES]

const SIZES = ["S", "M", "L", "XL"]

// Real product/inventory images can't be faked, so only text and counts are
// generated — everything else (URLs) stays picked from a known-good set.
const FAKER_SEED = 20260831

function uniqueBy<T>(
  count: number,
  generate: () => T,
  key: (value: T) => string,
  usedKeys: Set<string>,
): T[] {
  const values: T[] = []
  while (values.length < count) {
    const value = generate()
    const generatedKey = key(value)
    if (usedKeys.has(generatedKey)) {
      continue
    }
    usedKeys.add(generatedKey)
    values.push(value)
  }
  return values
}

function buildProductFixture(vendorHandle: string, usedHandles: Set<string>): ProductFixture {
  const [title] = uniqueBy(
    1,
    () => faker.commerce.productName(),
    (value) => `${vendorHandle}-${toHandle(value)}`,
    usedHandles,
  )

  const variantCount = faker.number.int({ min: 2, max: 3 })
  const optionValues = faker.helpers
    .arrayElements(SIZES, variantCount)
    .sort((a, b) => SIZES.indexOf(a) - SIZES.indexOf(b))

  return {
    title,
    description: faker.commerce.productDescription(),
    optionTitle: "Size",
    optionValues,
    basePrice: faker.number.int({ min: 10, max: 50 }),
    images: faker.helpers.arrayElement(IMAGE_SETS),
  }
}

function buildVendorFixture(usedVendorHandles: Set<string>): VendorFixture {
  const [name] = uniqueBy(
    1,
    () => faker.company.name(),
    (value) => toHandle(value),
    usedVendorHandles,
  )
  const handle = toHandle(name)

  const productCount = faker.number.int({ min: 2, max: 3 })
  const usedProductHandles = new Set<string>()
  const products = Array.from({ length: productCount }, () =>
    buildProductFixture(handle, usedProductHandles),
  )

  return {
    name,
    handle,
    email: `${handle}@example.com`,
    firstName: faker.person.firstName(),
    products,
  }
}

function buildVendorFixtures(): VendorFixture[] {
  faker.seed(FAKER_SEED)

  const vendorCount = faker.number.int({ min: 2, max: 3 })
  const usedVendorHandles = new Set<string>()

  return Array.from({ length: vendorCount }, () =>
    buildVendorFixture(usedVendorHandles),
  )
}

export default async function seedVendors({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { shippingProfileId, salesChannelId, storeCurrencies } =
    await resolveStorePrerequisites(query)

  logger.info("Seeding demo vendors, vendor users, and vendor products...")

  const vendorFixtures = buildVendorFixtures()

  for (const vendorFixture of vendorFixtures) {
    const { data: existingVendors } = await query.graph({
      entity: "vendor",
      fields: ["id"],
      filters: { handle: vendorFixture.handle },
    })

    let vendorId = existingVendors[0]?.id

    if (vendorId) {
      logger.info(`Vendor "${vendorFixture.name}" already exists, skipping.`)
    } else {
      const { result: vendor } = await createVendorWorkflow(container).run({
        input: { name: vendorFixture.name, handle: vendorFixture.handle },
      })
      vendorId = vendor.id
    }

    const { data: existingVendorUsers } = await query.graph({
      entity: "vendor_user",
      fields: ["id"],
      filters: { email: vendorFixture.email },
    })

    if (existingVendorUsers[0]) {
      logger.info(
        `Vendor user "${vendorFixture.email}" already exists, skipping — its password was only shown once, at creation.`,
      )
    } else {
      const { result: vendorUser } = await createVendorUserWorkflow(
        container,
      ).run({
        input: {
          vendor_id: vendorId,
          email: vendorFixture.email,
          first_name: vendorFixture.firstName,
        },
      })
      logger.info(
        `Vendor login for "${vendorFixture.name}" — email: ${vendorUser.email}  password: ${vendorUser.password}`,
      )
    }

    for (const productFixture of vendorFixture.products) {
      const handle = `${vendorFixture.handle}-${toHandle(productFixture.title)}`

      const { data: existingProducts } = await query.graph({
        entity: "product",
        fields: ["id"],
        filters: { handle },
      })

      if (existingProducts[0]) {
        logger.info(`Product "${handle}" already exists, skipping.`)
        continue
      }

      const options = [
        { title: productFixture.optionTitle, values: productFixture.optionValues },
      ]
      const variants: VendorVariantInput[] = productFixture.optionValues.map(
        (value, index) => ({
          optionValues: { [productFixture.optionTitle]: value },
          price: productFixture.basePrice + index * 5,
          sku: `${handle}-${value}`.toUpperCase(),
        }),
      )

      const { productOptions, productVariants } = resolveProductVariants(
        options,
        variants,
        storeCurrencies,
      )

      await createVendorProductWorkflow(container).run({
        input: {
          product: {
            title: productFixture.title,
            description: productFixture.description,
            handle,
            // Real vendor submissions default to PROPOSED, pending staff
            // review — seed products are published outright so they're
            // immediately browsable/purchasable for testing.
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfileId,
            images: productFixture.images.map((url) => ({ url })),
            variants: productVariants,
            sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
          },
          options: productOptions,
          shared: true,
          vendor_id: vendorId,
        },
      })

      logger.info(
        `Created vendor product "${productFixture.title}" for "${vendorFixture.name}" (${variants.length} variants).`,
      )
    }
  }

  logger.info("Finished seeding demo vendors.")
}
