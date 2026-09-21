import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/vendor-users/create-vendor-user"

jest.setTimeout(60000)

const validVariant = { optionValues: {}, price: 1000, sku: "VALID-SKU" }

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/vendors/products input handling", () => {
      let vendorHeaders: { Authorization: string }

      const createProduct = (body: unknown) =>
        api.post("/vendors/products", body, { headers: vendorHeaders })

      const expectRejected = async (body: unknown) => {
        await expect(createProduct(body)).rejects.toMatchObject({
          response: { status: 400 },
        })
      }

      beforeAll(async () => {
        const container = getContainer()

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name: "Validation Vendor" },
        })

        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: vendor.id,
            email: "validation-vendor@test.com",
            password: "test1234",
            first_name: "Validation",
          },
        })

        const login = await api.post("/auth/vendor/emailpass", {
          email: "validation-vendor@test.com",
          password: "test1234",
        })
        vendorHeaders = { Authorization: `Bearer ${login.data.token}` }
      })

      describe("a product a vendor should not be able to create", () => {
        it("rejects a product with no title", async () => {
          await expectRejected({ variants: [validVariant] })
        })

        it("rejects a blank title", async () => {
          await expectRejected({ title: "   ", variants: [validVariant] })
        })

        it("rejects a product with no variants at all", async () => {
          await expectRejected({ title: "No Variants", variants: [] })
        })

        it("rejects a product with the variants key missing", async () => {
          await expectRejected({ title: "Missing Variants" })
        })

        it("rejects a variant with no price", async () => {
          await expectRejected({
            title: "Priceless",
            variants: [{ optionValues: {}, sku: "NO-PRICE" }],
          })
        })

        it("rejects a zero price", async () => {
          await expectRejected({
            title: "Free",
            variants: [{ optionValues: {}, price: 0 }],
          })
        })

        it("rejects a negative price", async () => {
          await expectRejected({
            title: "Negative",
            variants: [{ optionValues: {}, price: -100 }],
          })
        })

        it("rejects a price sent as a string", async () => {
          await expectRejected({
            title: "Stringly Priced",
            variants: [{ optionValues: {}, price: "1000" }],
          })
        })

        it("rejects an unknown field instead of silently dropping it", async () => {
          await expectRejected({
            title: "Sneaky",
            variants: [validVariant],
            is_admin: true,
          })
        })

        it("rejects an unknown field on a variant", async () => {
          await expectRejected({
            title: "Sneaky Variant",
            variants: [{ ...validVariant, vendor_id: "someone-else" }],
          })
        })

        it("rejects a category that does not exist", async () => {
          await expect(
            createProduct({
              title: "Bad Category",
              variants: [validVariant],
              category_ids: ["pcat_does_not_exist"],
            }),
          ).rejects.toMatchObject({ response: { status: 404 } })
        })

        it("rejects a variant whose options do not match the declared options", async () => {
          await expectRejected({
            title: "Mismatched Options",
            options: [{ title: "Size", values: ["S", "M"] }],
            variants: [{ optionValues: { Colour: "Red" }, price: 100 }],
          })
        })

        it("rejects an empty body", async () => {
          await expectRejected({})
        })
      })

      describe("limits and oversized input", () => {
        it("rejects more variants than the contract allows", async () => {
          await expectRejected({
            title: "Too Many Variants",
            options: [
              {
                title: "Size",
                values: Array.from({ length: 51 }, (_, i) => `S${i}`),
              },
            ],
            variants: Array.from({ length: 51 }, (_, i) => ({
              optionValues: { Size: `S${i}` },
              price: 100 + i,
            })),
          })
        })

        it("rejects more categories than the contract allows", async () => {
          await expectRejected({
            title: "Too Many Categories",
            variants: [validVariant],
            category_ids: Array.from({ length: 11 }, (_, i) => `pcat_${i}`),
          })
        })

        it("accepts the largest allowed variant set", async () => {
          const sizes = Array.from({ length: 10 }, (_, i) => `Size${i}`)
          const colours = Array.from({ length: 5 }, (_, i) => `Colour${i}`)

          const response = await createProduct({
            title: "Fifty Variants",
            options: [
              { title: "Size", values: sizes },
              { title: "Colour", values: colours },
            ],
            variants: sizes.flatMap((size, sizeIndex) =>
              colours.map((colour, colourIndex) => ({
                optionValues: { Size: size, Colour: colour },
                price: 100 + sizeIndex * 10 + colourIndex,
                sku: `BULK-${size}-${colour}`,
              })),
            ),
          })

          expect(response.status).toBe(200)

          const detail = await api.get(
            `/vendors/products/${response.data.product.id}`,
            { headers: vendorHeaders },
          )
          expect(detail.data.product.variants).toHaveLength(50)
        })

        it("survives a very long title without corrupting it", async () => {
          const title = "L".repeat(2000)

          const response = await createProduct({
            title,
            variants: [{ optionValues: {}, price: 500 }],
          }).catch(
            (error: { response?: { status?: number } }) => error.response,
          )

          if (response && "data" in response && response.status === 200) {
            expect(response.data.product.title).toHaveLength(2000)
          } else {
            expect(response?.status).toBe(400)
          }
        })
      })

      describe("duplicate identities", () => {
        it("refuses to reuse a handle already taken by this vendor", async () => {
          const body = {
            title: "Handle Holder",
            handle: "taken-handle",
            variants: [{ optionValues: {}, price: 1000 }],
          }

          const first = await createProduct(body)
          expect(first.status).toBe(200)

          await expect(createProduct(body)).rejects.toMatchObject({
            response: { status: expect.any(Number) },
          })
        })

        it("refuses to reuse a SKU already taken", async () => {
          const first = await createProduct({
            title: "Sku Holder",
            variants: [{ optionValues: {}, price: 1000, sku: "UNIQUE-SKU" }],
          })
          expect(first.status).toBe(200)

          await expect(
            createProduct({
              title: "Sku Thief",
              variants: [{ optionValues: {}, price: 1000, sku: "UNIQUE-SKU" }],
            }),
          ).rejects.toMatchObject({ response: {} })
        })
      })
    })
  },
})
