import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import type { ShopifyProduct } from "../../src/integrations/shopify/products"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/vendor-users/create-vendor-user"
import { VENDOR_MODULE } from "../../src/modules/vendor"

jest.setTimeout(60000)

jest.mock("../../src/integrations/shopify/products", () => ({
  pullShopifyProducts: jest.fn(),
  pullShopifyProductsByIds: jest.fn(),
}))

type PullMock = jest.Mock<(...args: never[]) => Promise<unknown>>

const { pullShopifyProductsByIds, pullShopifyProducts } = jest.requireMock(
  "../../src/integrations/shopify/products",
) as { pullShopifyProductsByIds: PullMock; pullShopifyProducts: PullMock }

const STORE_DOMAIN = "import-test-store.myshopify.com"

function shopifyProduct(
  overrides: Partial<ShopifyProduct> = {},
): ShopifyProduct {
  return {
    shopify_id: "gid://shopify/Product/100",
    title: "Imported Tee",
    handle: "imported-tee",
    description: "From Shopify",
    status: "ACTIVE",
    options: [{ name: "Size", values: ["S", "M"] }],
    image_urls: ["https://cdn.example.com/imported-tee.png"],
    variants: [
      {
        title: "S",
        sku: "IMP-S",
        price: "25.00",
        options: [{ name: "Size", value: "S" }],
      },
    ],
    collections: [],
    ...overrides,
  }
}

const pullReturns = (products: ShopifyProduct[], currencyCode = "eur") => {
  pullShopifyProductsByIds.mockResolvedValue({
    currency_code: currencyCode,
    products,
  })
}

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("POST /vendors/shopify/products/import", () => {
      let vendorHeaders: { Authorization: string }
      let vendorId: string

      const importIds = (ids: string[]) =>
        api.post(
          "/vendors/shopify/products/import",
          { shopify_product_ids: ids },
          { headers: vendorHeaders },
        )

      const listVendorProducts = async () => {
        const response = await api.get("/vendors/products?limit=100", {
          headers: vendorHeaders,
        })
        return response.data.products
      }

      beforeAll(async () => {
        const container = getContainer()

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name: "Import Vendor" },
        })
        vendorId = vendor.id

        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: vendor.id,
            email: "import-vendor@test.com",
            password: "test1234",
            name: "Import",
          },
        })

        const login = await api.post("/auth/vendor/emailpass", {
          email: "import-vendor@test.com",
          password: "test1234",
        })
        vendorHeaders = { Authorization: `Bearer ${login.data.token}` }

        // Stands in for a completed OAuth round trip, which cannot run here:
        // the import only needs a stored domain plus access token.
        const vendorModuleService: any = container.resolve(VENDOR_MODULE)
        await vendorModuleService.createVendorIntegrationConnections({
          vendor_id: vendorId,
          provider: "shopify",
          external_account_identifier: STORE_DOMAIN,
          client_id: "import-client-id",
          client_secret: "import-client-secret",
          access_token: "shpat_fake_token",
          connected_at: new Date(),
        })
      })

      describe("GET /vendors/shopify/products", () => {
        const listReturns = (products: ShopifyProduct[]) => {
          pullShopifyProducts.mockResolvedValue({
            currency_code: "eur",
            has_next_page: false,
            products,
          })
        }

        it("rejects an unauthenticated listing", async () => {
          await expect(
            api.get("/vendors/shopify/products"),
          ).rejects.toMatchObject({ response: { status: 401 } })
        })

        it("lists what the vendor could import", async () => {
          listReturns([
            shopifyProduct({
              shopify_id: "gid://shopify/Product/700",
              title: "Listable",
              handle: "listable",
            }),
          ])

          const response = await api.get("/vendors/shopify/products", {
            headers: vendorHeaders,
          })

          expect(response.status).toBe(200)
          expect(response.data.products).toHaveLength(1)
          expect(response.data.products[0]).toMatchObject({
            title: "Listable",
            already_imported: false,
          })
        })

        it("flags a product that was already imported", async () => {
          const product = shopifyProduct({
            shopify_id: "gid://shopify/Product/800",
            title: "Already Here",
            handle: "already-here",
          })

          pullReturns([product])
          await importIds(["gid://shopify/Product/800"])

          listReturns([product])
          const response = await api.get("/vendors/shopify/products", {
            headers: vendorHeaders,
          })

          expect(response.data.products[0].already_imported).toBe(true)
        })

        it("returns an empty catalogue without erroring", async () => {
          listReturns([])

          const response = await api.get("/vendors/shopify/products", {
            headers: vendorHeaders,
          })

          expect(response.status).toBe(200)
          expect(response.data.products).toHaveLength(0)
        })

        it("surfaces a Shopify outage instead of pretending the store is empty", async () => {
          pullShopifyProducts.mockRejectedValueOnce(
            new Error("Shopify request failed with status 500"),
          )

          await expect(
            api.get("/vendors/shopify/products", { headers: vendorHeaders }),
          ).rejects.toMatchObject({ response: {} })
        })
      })

      it("rejects an unauthenticated import", async () => {
        await expect(
          api.post("/vendors/shopify/products/import", {
            shopify_product_ids: ["gid://shopify/Product/100"],
          }),
        ).rejects.toMatchObject({ response: { status: 401 } })
      })

      it("imports a well-formed Shopify product for review", async () => {
        pullReturns([shopifyProduct()])

        const response = await importIds(["gid://shopify/Product/100"])

        expect(response.status).toBe(200)
        expect(response.data.created_count).toBe(1)

        const products = await listVendorProducts()
        const imported = products.find(
          (product: { title: string }) => product.title === "Imported Tee",
        )
        expect(imported).toBeDefined()
      })

      it("re-importing the same product updates it instead of duplicating it", async () => {
        pullReturns([
          shopifyProduct({
            shopify_id: "gid://shopify/Product/200",
            title: "Resync Tee",
            handle: "resync-tee",
          }),
        ])
        await importIds(["gid://shopify/Product/200"])

        pullReturns([
          shopifyProduct({
            shopify_id: "gid://shopify/Product/200",
            title: "Resync Tee Renamed",
            handle: "resync-tee",
          }),
        ])
        const second = await importIds(["gid://shopify/Product/200"])

        expect(second.data.created_count).toBe(0)
        expect(second.data.updated_count).toBe(1)

        const products = await listVendorProducts()
        const matching = products.filter((product: { title: string }) =>
          product.title.startsWith("Resync Tee"),
        )
        expect(matching).toHaveLength(1)
        expect(matching[0].title).toBe("Resync Tee Renamed")
      })

      describe("broken Shopify products", () => {
        it("imports a product that has no variants", async () => {
          pullReturns([
            shopifyProduct({
              shopify_id: "gid://shopify/Product/300",
              title: "No Variants",
              handle: "no-variants",
              options: [],
              variants: [],
            }),
          ])

          const response = await importIds(["gid://shopify/Product/300"])

          expect(response.status).toBe(200)
          expect(response.data.created_count).toBe(1)
        })

        it("imports a product whose variant price is not a number", async () => {
          pullReturns([
            shopifyProduct({
              shopify_id: "gid://shopify/Product/400",
              title: "Bad Price",
              handle: "bad-price",
              variants: [
                {
                  title: "S",
                  sku: "BAD-S",
                  price: "not-a-number",
                  options: [{ name: "Size", value: "S" }],
                },
              ],
            }),
          ])

          const response = await importIds(["gid://shopify/Product/400"])

          expect(response.status).toBe(200)
          expect(response.data.created_count).toBe(1)
        })

        it("imports a product with no images and a null SKU", async () => {
          pullReturns([
            shopifyProduct({
              shopify_id: "gid://shopify/Product/500",
              title: "Bare Product",
              handle: "bare-product",
              image_urls: [],
              variants: [
                {
                  title: "One",
                  sku: null,
                  price: "10.00",
                  options: [{ name: "Size", value: "S" }],
                },
              ],
            }),
          ])

          const response = await importIds(["gid://shopify/Product/500"])

          expect(response.status).toBe(200)
          expect(response.data.created_count).toBe(1)
        })

        it("is a no-op when Shopify returns nothing for the requested ids", async () => {
          pullReturns([])

          const response = await importIds(["gid://shopify/Product/999"])

          expect(response.status).toBe(200)
          expect(response.data).toMatchObject({
            created_count: 0,
            updated_count: 0,
          })
        })

        it("refuses to import when the Shopify shop currency is not supported by the store", async () => {
          pullReturns(
            [shopifyProduct({ shopify_id: "gid://shopify/Product/600" })],
            "jpy",
          )

          await expect(
            importIds(["gid://shopify/Product/600"]),
          ).rejects.toMatchObject({ response: {} })
        })

        it("surfaces a Shopify outage as a failed request, not a silent success", async () => {
          pullShopifyProductsByIds.mockRejectedValueOnce(
            new Error("Shopify request failed with status 503"),
          )

          await expect(
            importIds(["gid://shopify/Product/100"]),
          ).rejects.toMatchObject({ response: {} })
        })
      })
    })
  },
})
