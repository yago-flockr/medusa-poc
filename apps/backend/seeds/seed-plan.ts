import { Faker, en, en_GB, simpleFaker } from "@faker-js/faker"
import { DEFAULT_COUNTRY_CODE } from "../src/lib/markets"
import type { SeedConfig, SeedRange } from "./seed-config"

const IMAGE_BASE_URL = "https://medusa-public-images.s3.eu-west-1.amazonaws.com"
const IMAGE_SETS = [
  ["tee-black-front.png", "tee-white-front.png"],
  ["sweatshirt-vintage-front.png", "sweatshirt-vintage-back.png"],
  ["shorts-vintage-front.png", "shorts-vintage-back.png"],
].map((files) => files.map((file) => `${IMAGE_BASE_URL}/${file}`))

export type SeedAddress = {
  address_1: string
  city: string
  province: string
  postal_code: string
  country_code: string
}

export type ProductOptionPlan = { title: string; values: string[] }

export type VariantPlan = {
  optionValues: Record<string, string>
  sku: string
  price: number
  stock: number
}

export type ProductPlan = {
  title: string
  handle: string
  description: string
  images: string[]
  options: ProductOptionPlan[]
  variants: VariantPlan[]
  categoryHandles: string[]
  collectionHandle: string | null
}

export type VendorPlan = {
  name: string
  handle: string
  email: string
  password: string
  userName: string
  description: string
  commissionRate: number
  locations: { name: string; address: SeedAddress }[]
  products: ProductPlan[]
}

export type AffiliatePlan = {
  name: string
  handle: string
  email: string
  password: string
  commissionRate: number
  productHandles: string[]
}

export type CategoryPlan = {
  name: string
  handle: string
  description: string
  heroImageUrl: string
}

export type CollectionPlan = {
  title: string
  handle: string
  description: string
  heroImageUrl: string
}

export type OrderPlan = {
  email: string
  firstName: string
  lastName: string
  address: SeedAddress
  affiliateHandle: string | null
  items: { sku: string; quantity: number }[]
}

export type SeedPlan = {
  staff: { email: string; password: string }[]
  categories: CategoryPlan[]
  collections: CollectionPlan[]
  vendors: VendorPlan[]
  affiliates: AffiliatePlan[]
  orders: OrderPlan[]
}

function assertSeedConfig(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`SEED_CONFIG: ${message}`)
  }
}

function toHandle(value: string) {
  return simpleFaker.helpers.slugify(value).toLowerCase()
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function buildVariantCombinations(options: ProductOptionPlan[]) {
  return options.reduce<Record<string, string>[]>(
    (combinations, option) =>
      combinations.flatMap((combination) =>
        option.values.map((value) => ({
          ...combination,
          [option.title]: value,
        })),
      ),
    [{}],
  )
}

function buildAddress(faker: Faker): SeedAddress {
  return {
    address_1: faker.location.streetAddress(),
    city: faker.location.city(),
    province: faker.location.county(),
    postal_code: faker.location.zipCode(),
    country_code: DEFAULT_COUNTRY_CODE,
  }
}

function buildProduct(
  faker: Faker,
  config: SeedConfig,
  vendorHandle: string,
  title: string,
  optionTitles: string[],
): ProductPlan {
  const handle = `${vendorHandle}-${toHandle(title)}`
  const price = faker.number.int(config.productPrice)
  const options = optionTitles.map((optionTitle) => ({
    title: optionTitle,
    values: config.productOptions[optionTitle],
  }))

  return {
    title,
    handle,
    description: faker.commerce.productDescription(),
    images: faker.helpers.arrayElement(IMAGE_SETS),
    options,
    variants: buildVariantCombinations(options).map((optionValues) => ({
      optionValues,
      sku: [handle, ...Object.values(optionValues)].join("-").toUpperCase(),
      price,
      stock: faker.number.int(config.stockPerVariant),
    })),
    categoryHandles: [],
    collectionHandle: null,
  }
}

function splitIntoOrderSizes(
  faker: Faker,
  total: number,
  orderCount: number,
  range: SeedRange,
) {
  const sizes = Array<number>(orderCount).fill(range.min)

  for (let spare = total - orderCount * range.min; spare > 0; spare--) {
    const growable = sizes.flatMap((size, index) =>
      size < range.max ? [index] : [],
    )
    sizes[faker.helpers.arrayElement(growable)]++
  }

  return sizes
}

function assignVendorsToOrders(
  faker: Faker,
  vendors: VendorPlan[],
  orderCounts: number[],
  sizes: number[],
) {
  const remaining = new Map(
    vendors.map((vendor, index) => [vendor, orderCounts[index]]),
  )
  const vendorsByOrder = sizes.map(() => [] as VendorPlan[])
  const largestFirst = sizes
    .map((_, index) => index)
    .sort((left, right) => sizes[right] - sizes[left])

  for (const orderIndex of largestFirst) {
    const picked = faker.helpers
      .shuffle(vendors.filter((vendor) => remaining.get(vendor)! > 0))
      .sort((left, right) => remaining.get(right)! - remaining.get(left)!)
      .slice(0, sizes[orderIndex])

    if (picked.length < sizes[orderIndex]) {
      return null
    }

    for (const vendor of picked) {
      remaining.set(vendor, remaining.get(vendor)! - 1)
    }
    vendorsByOrder[orderIndex] = picked
  }

  return vendorsByOrder
}

function planOrderLinks(
  faker: Faker,
  config: SeedConfig,
  vendors: VendorPlan[],
  affiliates: AffiliatePlan[],
) {
  const { vendorsPerOrder, affiliatesPerOrder } = config

  for (let attempt = 0; attempt < 100; attempt++) {
    const vendorOrderCounts = vendors.map(() =>
      faker.number.int(config.ordersPerVendor),
    )
    const affiliateOrderCounts = affiliates.map(() =>
      faker.number.int(config.ordersPerAffiliate),
    )
    const vendorLinks = sum(vendorOrderCounts)
    const affiliateLinks = sum(affiliateOrderCounts)
    const orderCount = Math.max(
      ...vendorOrderCounts,
      Math.ceil(vendorLinks / vendorsPerOrder.max),
      affiliatesPerOrder.max > affiliatesPerOrder.min
        ? Math.floor(affiliateLinks / affiliatesPerOrder.max) + 1
        : Math.ceil(affiliateLinks / affiliatesPerOrder.max),
    )
    const spareVendorLinks = vendorLinks - orderCount * vendorsPerOrder.min

    if (
      spareVendorLinks < 0 ||
      (spareVendorLinks === 0 && vendorsPerOrder.max > vendorsPerOrder.min) ||
      affiliateLinks < orderCount * affiliatesPerOrder.min
    ) {
      continue
    }

    const vendorsByOrder = assignVendorsToOrders(
      faker,
      vendors,
      vendorOrderCounts,
      splitIntoOrderSizes(faker, vendorLinks, orderCount, vendorsPerOrder),
    )

    if (!vendorsByOrder) {
      continue
    }

    const affiliateByOrder = faker.helpers.shuffle([
      ...affiliates.flatMap((affiliate, index) =>
        Array<AffiliatePlan | null>(affiliateOrderCounts[index]).fill(
          affiliate,
        ),
      ),
      ...Array<AffiliatePlan | null>(orderCount - affiliateLinks).fill(null),
    ])

    return { vendorsByOrder, affiliateByOrder }
  }

  throw new Error(
    "SEED_CONFIG: ordersPerVendor, ordersPerAffiliate, vendorsPerOrder and affiliatesPerOrder can't all be satisfied at once — widen one of them.",
  )
}

function assertRangeFits(range: SeedRange, available: number, label: string) {
  assertSeedConfig(
    range.min <= available,
    `${label}.min is ${range.min} but only ${available} products exist.`,
  )
}

function assertStockCoversOrders(products: ProductPlan[], orders: OrderPlan[]) {
  for (const variant of products.flatMap((product) => product.variants)) {
    const ordered = sum(
      orders
        .flatMap((order) => order.items)
        .filter((item) => item.sku === variant.sku)
        .map((item) => item.quantity),
    )

    assertSeedConfig(
      ordered <= variant.stock,
      `orders buy ${ordered} of ${variant.sku} but stockPerVariant gave it ${variant.stock} — raise stockPerVariant or lower quantityPerOrderItem.`,
    )
  }
}

export function buildSeedPlan(config: SeedConfig): SeedPlan {
  const faker = new Faker({ locale: [en_GB, en], seed: config.randomSeed })

  assertSeedConfig(
    config.vendors.length > 0,
    "at least one vendor is required.",
  )
  assertSeedConfig(
    config.affiliatesPerOrder.max === 1,
    "affiliatesPerOrder.max must be 1 — an order carries a single affiliate_handle.",
  )
  assertSeedConfig(
    config.vendorsPerOrder.max <= config.productsPerOrder.max,
    "vendorsPerOrder.max can't exceed productsPerOrder.max — each vendor in an order needs a product.",
  )

  const productCounts = config.vendors.map(() =>
    faker.number.int(config.productsPerVendor),
  )
  const titles = faker.helpers.uniqueArray(
    () => faker.commerce.productName(),
    sum(productCounts),
  )

  let productIndex = 0
  const vendors: VendorPlan[] = config.vendors.map((login, vendorIndex) => {
    const name = `${capitalize(login)} Vendor`
    const handle = toHandle(name)

    return {
      name,
      handle,
      email: `${login}@vendor.com`,
      password: config.password,
      userName: faker.person.fullName(),
      description: faker.company.catchPhrase(),
      commissionRate: faker.number.float({
        ...config.commissionRate,
        multipleOf: 0.01,
      }),
      locations: Array.from(
        { length: faker.number.int(config.locationsPerVendor) },
        (_, locationIndex) => ({
          name: `${name} Warehouse ${locationIndex + 1}`,
          address: buildAddress(faker),
        }),
      ),
      products: Array.from({ length: productCounts[vendorIndex] }, () => {
        const index = productIndex++
        return buildProduct(
          faker,
          config,
          handle,
          titles[index],
          config.productOptionSets[index % config.productOptionSets.length],
        )
      }),
    }
  })

  const products = vendors.flatMap((vendor) => vendor.products)

  assertRangeFits(
    config.productsPerCategory,
    products.length,
    "productsPerCategory",
  )
  const categories: CategoryPlan[] = faker.helpers
    .uniqueArray(
      () => faker.commerce.department(),
      faker.number.int(config.categories),
    )
    .map((name) => {
      const handle = toHandle(name)
      for (const product of faker.helpers.arrayElements(
        products,
        config.productsPerCategory,
      )) {
        product.categoryHandles.push(handle)
      }

      return {
        name,
        handle,
        description: faker.commerce.productDescription(),
        heroImageUrl: faker.helpers.arrayElement(IMAGE_SETS)[0],
      }
    })

  const collectionPool = faker.helpers.shuffle(products)
  const collections: CollectionPlan[] = faker.helpers
    .uniqueArray(
      () => faker.commerce.productAdjective(),
      faker.number.int(config.collections),
    )
    .map((adjective) => {
      const title = `${adjective} Collection`
      const handle = toHandle(title)
      assertRangeFits(
        config.productsPerCollection,
        collectionPool.length,
        "productsPerCollection (collections never share a product)",
      )
      const count = faker.number.int({
        min: config.productsPerCollection.min,
        max: Math.min(config.productsPerCollection.max, collectionPool.length),
      })
      for (const product of collectionPool.splice(0, count)) {
        product.collectionHandle = handle
      }

      return {
        title,
        handle,
        description: faker.commerce.productDescription(),
        heroImageUrl: faker.helpers.arrayElement(IMAGE_SETS)[0],
      }
    })

  assertRangeFits(
    config.productsPerAffiliate,
    products.length,
    "productsPerAffiliate",
  )
  const affiliates: AffiliatePlan[] = config.affiliates.map((login) => {
    const name = `${capitalize(login)} Affiliate`

    return {
      name,
      handle: toHandle(name),
      email: `${login}@affiliate.com`,
      password: config.password,
      commissionRate: faker.number.float({
        ...config.commissionRate,
        multipleOf: 0.01,
      }),
      productHandles: faker.helpers
        .arrayElements(products, config.productsPerAffiliate)
        .map((product) => product.handle),
    }
  })

  const { vendorsByOrder, affiliateByOrder } = planOrderLinks(
    faker,
    config,
    vendors,
    affiliates,
  )

  const orders: OrderPlan[] = vendorsByOrder.map((orderVendors, orderIndex) => {
    const productCount = faker.number.int({
      min: Math.max(config.productsPerOrder.min, orderVendors.length),
      max: config.productsPerOrder.max,
    })
    const onePerVendor = orderVendors.map((vendor) =>
      faker.helpers.arrayElement(vendor.products),
    )
    const extras = faker.helpers.arrayElements(
      orderVendors
        .flatMap((vendor) => vendor.products)
        .filter((product) => !onePerVendor.includes(product)),
      productCount - onePerVendor.length,
    )
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    return {
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      firstName,
      lastName,
      address: buildAddress(faker),
      affiliateHandle: affiliateByOrder[orderIndex]?.handle ?? null,
      items: [...onePerVendor, ...extras].map((product) => ({
        sku: faker.helpers.arrayElement(product.variants).sku,
        quantity: faker.number.int(config.quantityPerOrderItem),
      })),
    }
  })

  assertStockCoversOrders(products, orders)

  return {
    staff: config.staff.map((login) => ({
      email: `${login}@staff.com`,
      password: config.password,
    })),
    categories,
    collections,
    vendors,
    affiliates,
    orders,
  }
}
