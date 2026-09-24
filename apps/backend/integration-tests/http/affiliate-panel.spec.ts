import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  createProductsWorkflow,
  createSalesChannelsWorkflow,
  createShippingProfilesWorkflow,
} from "@medusajs/medusa/core-flows"
import { ProductStatus } from "@medusajs/framework/utils"
import { createAdminUserWorkflow } from "../../src/workflows/create-admin-user"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/affiliates/* (the affiliate's own panel)", () => {
      let adminHeaders: { Authorization: string }
      let publishedProductId: string
      let draftProductId: string

      const seedAffiliate = async (overrides: Record<string, unknown> = {}) => {
        const response = await api.post(
          "/admin/affiliates",
          {
            name: "Maria Silva",
            email: "maria@test.com",
            commission_rate: 0.1,
            ...overrides,
          },
          { headers: adminHeaders },
        )
        return response.data
      }

      const loginAs = async (email: string, password: string) => {
        const login = await api.post("/auth/affiliate/emailpass", {
          email,
          password,
        })
        return { Authorization: `Bearer ${login.data.token}` }
      }

      const seedAffiliateSession = async (
        overrides: Record<string, unknown> = {},
      ) => {
        const created = await seedAffiliate(overrides)
        const headers = await loginAs(created.affiliate.email, created.password)
        return { affiliate: created.affiliate, headers }
      }

      beforeAll(async () => {
        const container = getContainer()

        await createAdminUserWorkflow(container).run({
          input: {
            email: "affiliate-panel-admin@test.com",
            password: "test1234",
            first_name: "Panel",
          },
        })

        const login = await api.post("/auth/user/emailpass", {
          email: "affiliate-panel-admin@test.com",
          password: "test1234",
        })
        adminHeaders = { Authorization: `Bearer ${login.data.token}` }

        const { result: shippingProfile } =
          await createShippingProfilesWorkflow(container).run({
            input: { data: [{ name: "Panel Profile", type: "default" }] },
          })

        const { result: salesChannel } = await createSalesChannelsWorkflow(
          container,
        ).run({ input: { salesChannelsData: [{ name: "Panel Channel" }] } })

        const { result: products } = await createProductsWorkflow(
          container,
        ).run({
          input: {
            products: [
              {
                title: "Promotable Tee",
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
              {
                title: "Draft Hoodie",
                status: ProductStatus.DRAFT,
                shipping_profile_id: shippingProfile[0].id,
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

        publishedProductId = products[0].id
        draftProductId = products[1].id
      })

      describe("authentication", () => {
        it("rejects every route without a token", async () => {
          for (const path of [
            "/affiliates/me",
            "/affiliates/products",
            "/affiliates/sales",
          ]) {
            await expect(api.get(path)).rejects.toMatchObject({
              response: { status: 401 },
            })
          }
        })

        it("rejects an admin token — actor types are not interchangeable", async () => {
          await expect(
            api.get("/affiliates/me", { headers: adminHeaders }),
          ).rejects.toMatchObject({ response: { status: 401 } })
        })

        it("signs in with the password staff were handed at creation", async () => {
          const { headers } = await seedAffiliateSession()

          const response = await api.get("/affiliates/me", { headers })
          expect(response.data.affiliate).toMatchObject({
            handle: "maria-silva",
            email: "maria@test.com",
            commission_rate: 0.1,
            is_active: true,
          })
        })

        it("never exposes another affiliate through /me", async () => {
          const first = await seedAffiliateSession()
          await seedAffiliate({
            name: "Joao Pereira",
            email: "joao@test.com",
          })

          const response = await api.get("/affiliates/me", {
            headers: first.headers,
          })
          expect(response.data.affiliate.id).toBe(first.affiliate.id)
        })
      })

      describe("promoted products", () => {
        it("starts empty and lists what the affiliate promotes", async () => {
          const { headers } = await seedAffiliateSession()

          const before = await api.get("/affiliates/products", { headers })
          expect(before.data.products).toEqual([])

          const promoted = await api.post(
            "/affiliates/products",
            { product_id: publishedProductId },
            { headers },
          )
          expect(promoted.data.products).toHaveLength(1)
          expect(promoted.data.products[0]).toMatchObject({
            id: publishedProductId,
            title: "Promotable Tee",
          })

          const after = await api.get("/affiliates/products", { headers })
          expect(after.data.products).toHaveLength(1)
        })

        it("refuses to promote the same product twice", async () => {
          const { headers } = await seedAffiliateSession()
          await api.post(
            "/affiliates/products",
            { product_id: publishedProductId },
            { headers },
          )

          await expect(
            api.post(
              "/affiliates/products",
              { product_id: publishedProductId },
              { headers },
            ),
          ).rejects.toMatchObject({ response: { status: 400 } })
        })

        it("refuses to promote a product that is not published", async () => {
          const { headers } = await seedAffiliateSession()

          await expect(
            api.post(
              "/affiliates/products",
              { product_id: draftProductId },
              { headers },
            ),
          ).rejects.toMatchObject({ response: { status: 400 } })
        })

        it("refuses a product that does not exist", async () => {
          const { headers } = await seedAffiliateSession()

          await expect(
            api.post(
              "/affiliates/products",
              { product_id: "prod_does_not_exist" },
              { headers },
            ),
          ).rejects.toMatchObject({ response: { status: 404 } })
        })

        it("refuses a field the affiliate does not own", async () => {
          const { headers } = await seedAffiliateSession()

          await expect(
            api.post(
              "/affiliates/products",
              { product_id: publishedProductId, affiliate_id: "aff_other" },
              { headers },
            ),
          ).rejects.toMatchObject({ response: { status: 400 } })
        })

        it("stops promoting a product", async () => {
          const { headers } = await seedAffiliateSession()
          await api.post(
            "/affiliates/products",
            { product_id: publishedProductId },
            { headers },
          )

          const response = await api.delete(
            `/affiliates/products/${publishedProductId}`,
            { headers },
          )
          expect(response.data).toEqual({
            id: publishedProductId,
            object: "affiliate_product",
            deleted: true,
          })

          const after = await api.get("/affiliates/products", { headers })
          expect(after.data.products).toEqual([])
        })

        it("refuses to stop promoting something it never promoted", async () => {
          const { headers } = await seedAffiliateSession()

          await expect(
            api.delete(`/affiliates/products/${publishedProductId}`, {
              headers,
            }),
          ).rejects.toMatchObject({ response: { status: 404 } })
        })

        it("keeps one affiliate's promotions invisible to another", async () => {
          const promoter = await seedAffiliateSession()
          await api.post(
            "/affiliates/products",
            { product_id: publishedProductId },
            { headers: promoter.headers },
          )

          const other = await seedAffiliateSession({
            name: "Joao Pereira",
            email: "joao@test.com",
          })

          const theirs = await api.get("/affiliates/products", {
            headers: other.headers,
          })
          expect(theirs.data.products).toEqual([])

          await expect(
            api.delete(`/affiliates/products/${publishedProductId}`, {
              headers: other.headers,
            }),
          ).rejects.toMatchObject({ response: { status: 404 } })
        })
      })

      describe("sales", () => {
        it("is empty for an affiliate nobody has bought through", async () => {
          const { headers } = await seedAffiliateSession()

          const response = await api.get("/affiliates/sales", { headers })
          expect(response.data.totals.orders).toBe(0)
        })

        it("does not count a promoted product that has never sold", async () => {
          const { headers } = await seedAffiliateSession()
          await api.post(
            "/affiliates/products",
            { product_id: publishedProductId },
            { headers },
          )

          const response = await api.get("/affiliates/sales", { headers })
          expect(response.data.totals.orders).toBe(0)
        })

        it("reports nothing earned before anything sells", async () => {
          const { headers } = await seedAffiliateSession()

          const response = await api.get("/affiliates/sales", { headers })
          expect(response.data.totals).toEqual({
            orders: 0,
            units_sold: 0,
            revenue: 0,
            commission_total: 0,
          })
        })
      })
    })
  },
})
