import { SEED_CONFIG, type SeedRange } from "../seed-config"
import { buildSeedPlan, type SeedPlan } from "../seed-plan"

function expectInRange(values: number[], range: SeedRange) {
  for (const value of values) {
    expect(value).toBeGreaterThanOrEqual(range.min)
    expect(value).toBeLessThanOrEqual(range.max)
  }
}

function indexVariants(plan: SeedPlan) {
  const vendorBySku = new Map<string, string>()
  const productBySku = new Map<string, string>()

  for (const vendor of plan.vendors) {
    for (const product of vendor.products) {
      for (const variant of product.variants) {
        vendorBySku.set(variant.sku, vendor.handle)
        productBySku.set(variant.sku, product.handle)
      }
    }
  }

  return { vendorBySku, productBySku }
}

describe.each([1, 2, 3, 4, 5])(
  "buildSeedPlan with randomSeed %i",
  (randomSeed) => {
    const config = { ...SEED_CONFIG, randomSeed }
    const plan = buildSeedPlan(config)
    const products = plan.vendors.flatMap((vendor) => vendor.products)
    const { vendorBySku, productBySku } = indexVariants(plan)

    it("creates one login per configured name", () => {
      expect(plan.staff.map((staff) => staff.email)).toEqual(
        config.staff.map((name) => `${name}@staff.com`),
      )
      expect(plan.vendors.map((vendor) => vendor.email)).toEqual(
        config.vendors.map((name) => `${name}@vendor.com`),
      )
      expect(plan.affiliates.map((affiliate) => affiliate.email)).toEqual(
        config.affiliates.map((name) => `${name}@affiliate.com`),
      )
    })

    it("keeps every vendor within its ranges", () => {
      expectInRange(
        plan.vendors.map((vendor) => vendor.products.length),
        config.productsPerVendor,
      )
      expectInRange(
        plan.vendors.map((vendor) => vendor.locations.length),
        config.locationsPerVendor,
      )
      expectInRange(
        plan.vendors.map(
          (vendor) =>
            plan.orders.filter((order) =>
              order.items.some(
                (item) => vendorBySku.get(item.sku) === vendor.handle,
              ),
            ).length,
        ),
        config.ordersPerVendor,
      )
    })

    it("keeps every affiliate within its ranges", () => {
      expectInRange(
        plan.affiliates.map((affiliate) => affiliate.productHandles.length),
        config.productsPerAffiliate,
      )
      expectInRange(
        plan.affiliates.map(
          (affiliate) =>
            plan.orders.filter(
              (order) => order.affiliateHandle === affiliate.handle,
            ).length,
        ),
        config.ordersPerAffiliate,
      )
    })

    it("keeps every category and collection within its ranges", () => {
      expectInRange([plan.categories.length], config.categories)
      expectInRange([plan.collections.length], config.collections)
      expectInRange(
        plan.categories.map(
          (category) =>
            products.filter((product) =>
              product.categoryHandles.includes(category.handle),
            ).length,
        ),
        config.productsPerCategory,
      )
      expectInRange(
        plan.collections.map(
          (collection) =>
            products.filter(
              (product) => product.collectionHandle === collection.handle,
            ).length,
        ),
        config.productsPerCollection,
      )
    })

    it("keeps every order within its ranges", () => {
      expectInRange(
        plan.orders.map(
          (order) =>
            new Set(order.items.map((item) => vendorBySku.get(item.sku))).size,
        ),
        config.vendorsPerOrder,
      )
      expectInRange(
        plan.orders.map(
          (order) =>
            new Set(order.items.map((item) => productBySku.get(item.sku))).size,
        ),
        config.productsPerOrder,
      )
    })

    it("exercises both ends of affiliatesPerOrder", () => {
      const affiliateCounts = plan.orders.map((order) =>
        order.affiliateHandle ? 1 : 0,
      )

      expect(affiliateCounts).toContain(0)
      expect(affiliateCounts).toContain(1)
    })

    it("orders at least one multi-vendor order and stays within stock", () => {
      expect(
        plan.orders.some(
          (order) =>
            new Set(order.items.map((item) => vendorBySku.get(item.sku))).size >
            1,
        ),
      ).toBe(true)
      expectInRange(
        products.flatMap((product) =>
          product.variants.map((variant) => variant.stock),
        ),
        config.stockPerVariant,
      )
    })

    it("covers every configured option set", () => {
      const optionSets = new Set(
        products.map((product) =>
          product.options.map((option) => option.title).join("+"),
        ),
      )

      expect(optionSets).toEqual(
        new Set(config.productOptionSets.map((set) => set.join("+"))),
      )
    })

    it("builds the same plan every time", () => {
      expect(buildSeedPlan(config)).toEqual(plan)
    })
  },
)

it("rejects orders that would buy more than a variant's stock", () => {
  expect(() =>
    buildSeedPlan({
      ...SEED_CONFIG,
      stockPerVariant: { min: 0, max: 0 },
    }),
  ).toThrow("SEED_CONFIG: orders buy")
})

it("rejects ranges that can't all hold at once", () => {
  expect(() =>
    buildSeedPlan({
      ...SEED_CONFIG,
      ordersPerVendor: { min: 1, max: 1 },
      ordersPerAffiliate: { min: 5, max: 5 },
    }),
  ).toThrow("SEED_CONFIG:")
})
