import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("affiliate handle capture on the cart", () => {
      let storeHeaders: { "x-publishable-api-key": string }
      let regionId: string

      const createCart = (additionalData?: Record<string, unknown>) =>
        api.post(
          "/store/carts",
          {
            region_id: regionId,
            ...(additionalData ? { additional_data: additionalData } : {}),
          },
          { headers: storeHeaders },
        )

      const updateCart = (id: string, body: Record<string, unknown>) =>
        api.post(`/store/carts/${id}`, body, { headers: storeHeaders })

      beforeAll(async () => {
        const container = getContainer()

        const { result: regions } = await createRegionsWorkflow(container).run({
          input: {
            regions: [
              { name: "Referrals", currency_code: "gbp", countries: ["gb"] },
            ],
          },
        })
        regionId = regions[0].id

        const { result: salesChannels } = await createSalesChannelsWorkflow(
          container,
        ).run({ input: { salesChannelsData: [{ name: "Referrals Channel" }] } })

        const { result: apiKeys } = await createApiKeysWorkflow(container).run({
          input: {
            api_keys: [
              {
                title: "Referrals Key",
                type: "publishable",
                created_by: "test",
              },
            ],
          },
        })

        await linkSalesChannelsToApiKeyWorkflow(container).run({
          input: { id: apiKeys[0].id, add: [salesChannels[0].id] },
        })

        storeHeaders = { "x-publishable-api-key": apiKeys[0].token }
      })

      it("stores the handle on the cart when it is created", async () => {
        const response = await createCart({ affiliate_handle: "maria" })

        expect(response.data.cart.metadata).toEqual({
          affiliate_handle: "maria",
        })
      })

      it("leaves metadata alone when no handle is sent", async () => {
        const response = await createCart()

        expect(response.data.cart.metadata ?? null).toBeNull()
      })

      it("accepts a handle that matches no affiliate, so a dead code never blocks a sale", async () => {
        const response = await createCart({ affiliate_handle: "nobody-at-all" })

        expect(response.status).toBe(200)
        expect(response.data.cart.metadata).toEqual({
          affiliate_handle: "nobody-at-all",
        })
      })

      it("refuses an oversized handle from the public ?ref= payload", async () => {
        await expect(
          createCart({ affiliate_handle: "a".repeat(65) }),
        ).rejects.toMatchObject({ response: { status: 400 } })
      })

      it("refuses a handle that is not a string", async () => {
        await expect(
          createCart({ affiliate_handle: 12345 }),
        ).rejects.toMatchObject({ response: { status: 400 } })
      })

      it("lets a later handle win on an existing cart", async () => {
        const created = await createCart({ affiliate_handle: "maria" })

        const updated = await updateCart(created.data.cart.id, {
          additional_data: { affiliate_handle: "joao" },
        })

        expect(updated.data.cart.metadata).toMatchObject({
          affiliate_handle: "joao",
        })
      })

      it("keeps the existing handle when an update carries none", async () => {
        const created = await createCart({ affiliate_handle: "maria" })

        const updated = await updateCart(created.data.cart.id, {
          email: "buyer@example.com",
        })

        expect(updated.data.cart.metadata).toMatchObject({
          affiliate_handle: "maria",
        })
      })

      it("merges the handle into metadata instead of replacing it", async () => {
        const created = await api.post(
          "/store/carts",
          {
            region_id: regionId,
            metadata: { gift_note: "happy birthday" },
            additional_data: { affiliate_handle: "maria" },
          },
          { headers: storeHeaders },
        )

        expect(created.data.cart.metadata).toEqual({
          gift_note: "happy birthday",
          affiliate_handle: "maria",
        })
      })
    })
  },
})
