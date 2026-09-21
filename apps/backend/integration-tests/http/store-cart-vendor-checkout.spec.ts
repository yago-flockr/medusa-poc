import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingProfilesWorkflow,
} from "@medusajs/medusa/core-flows"
import { ProductStatus } from "@medusajs/framework/utils"
import { createAdminUserWorkflow } from "../../src/workflows/create-admin-user"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("vendor checkout on a store cart", () => {
      let storeHeaders: { headers: Record<string, string> }
      let regionId: string
      let vendorlessVariantId: string

      const createCart = async () => {
        const response = await api.post(
          "/store/carts",
          { region_id: regionId, email: "buyer@test.com" },
          storeHeaders,
        )
        return response.data.cart
      }

      const createCartWith = async (variantId: string) => {
        const cart = await createCart()
        await api.post(
          `/store/carts/${cart.id}/line-items`,
          { variant_id: variantId, quantity: 1 },
          storeHeaders,
        )
        return cart
      }

      const completeVendor = (cartId: string) =>
        api.post(`/store/carts/${cartId}/complete-vendor`, {}, storeHeaders)

      const vendorShippingOptions = (cartId: string) =>
        api.get(`/store/carts/${cartId}/vendor-shipping-options`, storeHeaders)

      beforeAll(async () => {
        const container = getContainer()

        await createAdminUserWorkflow(container).run({
          input: {
            email: "cart-checkout@test.com",
            password: "test1234",
            first_name: "Cart",
          },
        })
        const adminLogin = await api.post("/auth/user/emailpass", {
          email: "cart-checkout@test.com",
          password: "test1234",
        })
        const adminHeaders = {
          Authorization: `Bearer ${adminLogin.data.token}`,
        }

        const { result: region } = await createRegionsWorkflow(container).run({
          input: {
            regions: [
              {
                name: "Checkout Region",
                currency_code: "eur",
                countries: ["nl"],
              },
            ],
          },
        })
        regionId = region[0].id

        const { result: salesChannel } = await createSalesChannelsWorkflow(
          container,
        ).run({ input: { salesChannelsData: [{ name: "Checkout Channel" }] } })

        const apiKey = await api.post(
          "/admin/api-keys",
          { title: "Checkout Key", type: "publishable" },
          { headers: adminHeaders },
        )
        await api.post(
          `/admin/api-keys/${apiKey.data.api_key.id}/sales-channels`,
          { add: [salesChannel[0].id] },
          { headers: adminHeaders },
        )
        storeHeaders = {
          headers: { "x-publishable-api-key": apiKey.data.api_key.token },
        }

        const { result: shippingProfile } =
          await createShippingProfilesWorkflow(container).run({
            input: { data: [{ name: "Checkout Profile", type: "default" }] },
          })

        // Deliberately never linked to a vendor: this is the product that
        // must not be allowed through checkout.
        const { result: products } = await createProductsWorkflow(
          container,
        ).run({
          input: {
            products: [
              {
                title: "Vendorless Product",
                status: ProductStatus.PUBLISHED,
                shipping_profile_id: shippingProfile[0].id,
                sales_channels: [{ id: salesChannel[0].id }],
                options: [{ title: "Default", values: ["Default"] }],
                variants: [
                  {
                    title: "Default",
                    manage_inventory: false,
                    options: { Default: "Default" },
                    prices: [{ amount: 15, currency_code: "eur" }],
                  },
                ],
              },
            ],
          },
        })
        vendorlessVariantId = products[0].variants[0].id
      })

      describe("carts that should never complete", () => {
        it("refuses to complete a cart that does not exist", async () => {
          await expect(
            completeVendor("cart_does_not_exist"),
          ).rejects.toMatchObject({ response: { status: 404 } })
        })

        it("refuses to complete an empty cart", async () => {
          const cart = await createCart()

          await expect(completeVendor(cart.id)).rejects.toMatchObject({
            response: {},
          })
        })

        it("refuses to complete a cart holding a product with no vendor", async () => {
          const cart = await createCartWith(vendorlessVariantId)

          await expect(completeVendor(cart.id)).rejects.toMatchObject({
            response: { status: 400 },
          })
        })

        it("explains which product blocked the order", async () => {
          const cart = await createCartWith(vendorlessVariantId)

          const error = await completeVendor(cart.id).catch(
            (caught: { response: { data: { message?: string } } }) => caught,
          )

          expect(
            (error as { response: { data: { message?: string } } }).response
              .data.message,
          ).toContain("Vendorless Product")
        })

        it("leaves the cart still completable-looking rather than half-completed", async () => {
          const cart = await createCartWith(vendorlessVariantId)

          await completeVendor(cart.id).catch(() => undefined)

          const after = await api.get(`/store/carts/${cart.id}`, storeHeaders)
          expect(after.data.cart.completed_at ?? null).toBeNull()
        })
      })

      describe("vendor shipping options", () => {
        it("returns nothing to ship for an empty cart", async () => {
          const cart = await createCart()

          const response = await vendorShippingOptions(cart.id)

          expect(response.status).toBe(200)
          expect(Array.isArray(response.data.shipping_options)).toBe(true)
          expect(response.data.shipping_options).toHaveLength(0)
        })

        it("fails cleanly for a cart that does not exist", async () => {
          await expect(
            vendorShippingOptions("cart_does_not_exist"),
          ).rejects.toMatchObject({ response: { status: 404 } })
        })
      })
    })
  },
})
