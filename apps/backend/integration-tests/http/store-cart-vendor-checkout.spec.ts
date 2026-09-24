import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingProfilesWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { ProductStatus } from "@medusajs/framework/utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createAdminUserWorkflow } from "../../src/workflows/create-admin-user"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/vendor-users/create-vendor-user"
import { createVendorStockLocationWorkflow } from "../../src/workflows/vendor-stock-locations/create-vendor-stock-location"
import { createVendorProductWorkflow } from "../../src/workflows/vendor-products/create-vendor-product"
import { updateVendorProductWorkflow } from "../../src/workflows/vendor-products/update-vendor-product"
import { getVendorProductWorkflow } from "../../src/workflows/vendor-products/get-vendor-product"
import { setVendorInventoryLevelWorkflow } from "../../src/workflows/vendor-products/set-vendor-inventory-level"
import { VENDOR_MODULE } from "../../src/modules/vendor"
import { graph } from "../../src/lib/query"
import { STORE_SUPPORTED_CURRENCIES } from "../../src/lib/markets"

jest.setTimeout(60000)

type SeededVendor = {
  vendorId: string
  variantId: string
  unitPrice: number
  commissionRate: number
}

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("vendor checkout on a store cart", () => {
      let storeHeaders: { headers: Record<string, string> }
      let vendorStoreHeaders: { headers: Record<string, string> }
      let regionId: string
      let vendorRegionId: string
      let vendorlessVariantId: string
      let vendorA: SeededVendor
      let vendorB: SeededVendor

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

      const seedVendorWithProduct = async (
        handle: string,
        commissionRate: number,
        unitPrice: number,
      ): Promise<SeededVendor> => {
        const container = getContainer()

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name: `${handle} Co`, handle },
        })

        const vendorModuleService = container.resolve(VENDOR_MODULE)
        await vendorModuleService.updateVendors({
          id: vendor.id,
          commission_rate: commissionRate,
        })

        const { result: vendorUser } = await createVendorUserWorkflow(
          container,
        ).run({
          input: {
            vendor_id: vendor.id,
            email: `${handle}@test.com`,
            password: "test1234",
          },
        })
        const actorId = vendorUser.vendor_user.id

        const { result: location } = await createVendorStockLocationWorkflow(
          container,
        ).run({
          input: {
            actorId,
            name: `${handle} Warehouse`,
            address: {
              address_1: "1 Test Street",
              city: "London",
              postal_code: "E1 6AN",
              country_code: "gb",
            },
          },
        })

        const { result: product } = await createVendorProductWorkflow(
          container,
        ).run({
          input: {
            actorId,
            title: `${handle} Item`,
            handle: `${handle}-item`,
            options: [{ title: "Size", values: ["M"] }],
            variants: [
              {
                optionValues: { Size: "M" },
                price: unitPrice,
                sku: handle.toUpperCase(),
              },
            ],
          },
        })

        await updateVendorProductWorkflow(container).run({
          input: {
            actorId,
            productId: product.id,
            status: ProductStatus.PUBLISHED,
          },
        })

        const { result: detail } = await getVendorProductWorkflow(
          container,
        ).run({
          input: { actorId, productId: product.id },
        })

        await setVendorInventoryLevelWorkflow(container).run({
          input: {
            actorId,
            productId: product.id,
            variantId: detail.variants[0].id,
            locationId: location.stock_location.id,
            quantity: 50,
          },
        })

        return {
          vendorId: vendor.id,
          variantId: detail.variants[0].id,
          unitPrice,
          commissionRate,
        }
      }

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
                payment_providers: ["pp_system_default"],
              },
            ],
          },
        })
        regionId = region[0].id

        const { result: vendorRegion } = await createRegionsWorkflow(
          container,
        ).run({
          input: {
            regions: [
              {
                name: "Vendor Checkout Region",
                currency_code: "gbp",
                countries: ["gb"],
                payment_providers: ["pp_system_default"],
              },
            ],
          },
        })
        vendorRegionId = vendorRegion[0].id

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

        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const {
          data: [store],
        } = await graph(query, {
          entity: "store",
          fields: ["id", "default_sales_channel_id"],
        })

        // Vendor product prices are created per store currency, and the only
        // market this project has is UK/GBP.
        await updateStoresWorkflow(container).run({
          input: {
            selector: { id: store.id },
            update: {
              supported_currencies: [...STORE_SUPPORTED_CURRENCIES],
            },
          },
        })

        // Vendor products are always published to the store's default sales
        // channel, so vendor checkout needs its own key pointing at that one.
        const vendorApiKey = await api.post(
          "/admin/api-keys",
          { title: "Vendor Checkout Key", type: "publishable" },
          { headers: adminHeaders },
        )
        await api.post(
          `/admin/api-keys/${vendorApiKey.data.api_key.id}/sales-channels`,
          { add: [store.default_sales_channel_id] },
          { headers: adminHeaders },
        )
        vendorStoreHeaders = {
          headers: {
            "x-publishable-api-key": vendorApiKey.data.api_key.token,
          },
        }

        vendorA = await seedVendorWithProduct("alpha", 0.1, 100)
        vendorB = await seedVendorWithProduct("beta", 0.25, 40)
      })

      describe("an order across two vendors", () => {
        // An axios rejection is circular and crashes the jest worker before
        // its real cause is ever printed, so unwrap it into a plain Error.
        const readable = async <T>(call: () => Promise<T>): Promise<T> => {
          try {
            return await call()
          } catch (error) {
            const failure = error as {
              config?: { method?: string; url?: string }
              response?: { status?: number; data?: unknown }
            }
            if (!failure.config) {
              throw error
            }
            throw new Error(
              `${failure.config?.method?.toUpperCase()} ${failure.config?.url} -> ` +
                `${failure.response?.status} ${JSON.stringify(failure.response?.data)}`,
            )
          }
        }

        const completeTwoVendorCart = () =>
          readable(async () => {
            const cart = (
              await api.post(
                "/store/carts",
                { region_id: vendorRegionId, email: "buyer@test.com" },
                vendorStoreHeaders,
              )
            ).data.cart

            for (const vendor of [vendorA, vendorB]) {
              await api.post(
                `/store/carts/${cart.id}/line-items`,
                { variant_id: vendor.variantId, quantity: 1 },
                vendorStoreHeaders,
              )
            }

            await api.post(
              `/store/carts/${cart.id}`,
              {
                shipping_address: {
                  name: "Test Buyer",
                  address_1: "2 Test Street",
                  city: "London",
                  country_code: "gb",
                  postal_code: "E1 6AN",
                },
              },
              vendorStoreHeaders,
            )

            const { shipping_options: shippingOptions } = (
              await api.get(
                `/store/carts/${cart.id}/vendor-shipping-options`,
                vendorStoreHeaders,
              )
            ).data

            expect(shippingOptions.length).toBeGreaterThan(0)

            for (const option of shippingOptions) {
              await api.post(
                `/store/carts/${cart.id}/shipping-methods`,
                { option_id: option.id },
                vendorStoreHeaders,
              )
            }

            const paymentCollection = (
              await api.post(
                "/store/payment-collections",
                { cart_id: cart.id },
                vendorStoreHeaders,
              )
            ).data.payment_collection

            await api.post(
              `/store/payment-collections/${paymentCollection.id}/payment-sessions`,
              { provider_id: "pp_system_default" },
              vendorStoreHeaders,
            )

            const response = await api.post(
              `/store/carts/${cart.id}/complete-vendor`,
              {},
              vendorStoreHeaders,
            )

            return response.data.order
          })

        const consignmentsForOrder = async (orderId: string) => {
          const query = getContainer().resolve(ContainerRegistrationKeys.QUERY)
          const { data: links } = await graph(query, {
            entity: "consignment_order",
            fields: [
              "consignment.vendor_id",
              "consignment.currency_code",
              "consignment.subtotal",
              "consignment.commission_rate",
              "consignment.commission_total",
              "consignment.earning_total",
            ],
            filters: { order_id: orderId },
          })

          return links.map((link) => link.consignment!)
        }

        it("records what each vendor earned, at that vendor's own rate", async () => {
          const order = await completeTwoVendorCart()
          const consignments = await consignmentsForOrder(order.id)

          expect(consignments).toHaveLength(2)

          for (const vendor of [vendorA, vendorB]) {
            const consignment = consignments.find(
              (entry) => entry.vendor_id === vendor.vendorId,
            )

            expect(consignment).toMatchObject({
              currency_code: "gbp",
              subtotal: vendor.unitPrice,
              commission_rate: vendor.commissionRate,
              commission_total: vendor.unitPrice * vendor.commissionRate,
              earning_total:
                vendor.unitPrice - vendor.unitPrice * vendor.commissionRate,
            })
          }
        })

        it("never lets one vendor's commission touch another's earnings", async () => {
          const order = await completeTwoVendorCart()
          const consignments = await consignmentsForOrder(order.id)

          const totals = consignments.map(
            (consignment) =>
              Number(consignment.commission_total) +
              Number(consignment.earning_total),
          )
          const subtotals = consignments.map((consignment) =>
            Number(consignment.subtotal),
          )

          expect(totals).toEqual(subtotals)
        })
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
