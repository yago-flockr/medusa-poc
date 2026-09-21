import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createHmac } from "node:crypto"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/vendor-users/create-vendor-user"

jest.setTimeout(60000)

const STORE_DOMAIN = "callback-test-store.myshopify.com"
const CLIENT_ID = "callback-client-id"
const CLIENT_SECRET = "callback-client-secret"

function signQuery(
  query: Record<string, string>,
  secret: string,
): Record<string, string> {
  const message = Object.keys(query)
    .sort()
    .map((key) => `${key}=${query[key]}`)
    .join("&")

  return {
    ...query,
    hmac: createHmac("sha256", secret).update(message).digest("hex"),
  }
}

const toQueryString = (query: Record<string, string>) =>
  new URLSearchParams(query).toString()

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/hooks/shopify/oauth/callback", () => {
      let vendorHeaders: { Authorization: string }

      const callback = (query: Record<string, string>) =>
        api.get(`/hooks/shopify/oauth/callback?${toQueryString(query)}`, {
          maxRedirects: 0,
        })

      const readConnection = async () => {
        const me = await api.get("/vendors/me", { headers: vendorHeaders })
        return me.data.vendor.integration_connections?.[0]
      }

      beforeAll(async () => {
        const container = getContainer()

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name: "Callback Vendor" },
        })

        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: vendor.id,
            email: "callback-vendor@test.com",
            password: "test1234",
            first_name: "Callback",
          },
        })

        const login = await api.post("/auth/vendor/emailpass", {
          email: "callback-vendor@test.com",
          password: "test1234",
        })
        vendorHeaders = { Authorization: `Bearer ${login.data.token}` }

        await api.patch(
          "/vendors/shopify/connection",
          {
            shopify_store_domain: STORE_DOMAIN,
            shopify_client_id: CLIENT_ID,
            shopify_client_secret: CLIENT_SECRET,
          },
          { headers: vendorHeaders },
        )
      })

      it("redirects back to the vendor panel when Shopify sends no shop or code", async () => {
        await expect(callback({})).rejects.toMatchObject({
          response: {
            status: 302,
            headers: { location: expect.stringContaining("/vendor/shopify") },
          },
        })
      })

      it("redirects back to the vendor panel for an unknown shop domain", async () => {
        await expect(
          callback({ shop: "not-our-store.myshopify.com", code: "abc" }),
        ).rejects.toMatchObject({
          response: {
            status: 302,
            headers: { location: expect.stringContaining("/vendor/shopify") },
          },
        })
      })

      it("redirects instead of erroring when the callback signature is forged", async () => {
        await expect(
          callback({
            shop: STORE_DOMAIN,
            code: "abc",
            state: "x",
            hmac: "bad",
          }),
        ).rejects.toMatchObject({
          response: {
            status: 302,
            headers: { location: expect.stringContaining("/vendor/shopify") },
          },
        })
      })

      it("does not connect the vendor when the callback signature is forged", async () => {
        await callback({
          shop: STORE_DOMAIN,
          code: "abc",
          state: "x",
          hmac: "bad",
        }).catch(() => undefined)

        const connection = await readConnection()
        expect(connection?.connected_at ?? null).toBeNull()
      })

      it("does not connect the vendor when the signature is valid but the state is not", async () => {
        const query = signQuery(
          { shop: STORE_DOMAIN, code: "abc", state: "state-we-never-issued" },
          CLIENT_SECRET,
        )

        await callback(query).catch(() => undefined)

        const connection = await readConnection()
        expect(connection?.connected_at ?? null).toBeNull()
      })
    })
  },
})
