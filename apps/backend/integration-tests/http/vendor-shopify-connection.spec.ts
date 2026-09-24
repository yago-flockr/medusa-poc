import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/vendor-users/create-vendor-user"

jest.setTimeout(60000)

const STORE_DOMAIN = "e2e-test-store.myshopify.com"
const CLIENT_ID = "test-client-id"
const CLIENT_SECRET = "test-client-secret"

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/vendors/shopify/connection", () => {
      let vendorHeaders: { Authorization: string }

      const connect = () =>
        api.patch(
          "/vendors/shopify/connection",
          {
            shopify_store_domain: STORE_DOMAIN,
            shopify_client_id: CLIENT_ID,
            shopify_client_secret: CLIENT_SECRET,
          },
          { headers: vendorHeaders },
        )

      beforeAll(async () => {
        const container = getContainer()

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name: "Shopify Connection Vendor" },
        })

        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: vendor.id,
            email: "shopify-connection@test.com",
            password: "test1234",
            name: "Shopify",
          },
        })

        const login = await api.post("/auth/vendor/emailpass", {
          email: "shopify-connection@test.com",
          password: "test1234",
        })
        vendorHeaders = { Authorization: `Bearer ${login.data.token}` }
      })

      it("rejects unauthenticated requests", async () => {
        await expect(
          api.get("/vendors/shopify/connection/install-link"),
        ).rejects.toMatchObject({ response: { status: 401 } })
      })

      it("refuses to build an install link before the store is configured", async () => {
        await expect(
          api.get("/vendors/shopify/connection/install-link", {
            headers: vendorHeaders,
          }),
        ).rejects.toMatchObject({ response: { status: 400 } })
      })

      it("stores the vendor's Shopify store domain", async () => {
        const response = await connect()

        expect(response.status).toBe(200)
        expect(response.data.vendor.shopify_store_domain).toBe(STORE_DOMAIN)
      })

      it("never echoes the client secret back", async () => {
        const response = await connect()

        expect(JSON.stringify(response.data)).not.toContain(CLIENT_SECRET)
      })

      it("builds a Shopify authorize URL carrying the shop, client id, scopes and state", async () => {
        await connect()

        const response = await api.get(
          "/vendors/shopify/connection/install-link",
          { headers: vendorHeaders },
        )

        expect(response.status).toBe(200)

        const installUrl = new URL(response.data.install_link)
        expect(installUrl.host).toBe(STORE_DOMAIN)
        expect(installUrl.pathname).toBe("/admin/oauth/authorize")
        expect(installUrl.searchParams.get("client_id")).toBe(CLIENT_ID)
        expect(installUrl.searchParams.get("scope")).toBe(
          "read_products,read_inventory",
        )
        expect(installUrl.searchParams.get("state")).toEqual(expect.any(String))
        expect(
          installUrl.searchParams.get("state")!.length,
        ).toBeGreaterThanOrEqual(16)
        expect(installUrl.searchParams.get("redirect_uri")).toContain(
          "/hooks/shopify/oauth/callback",
        )
      })

      it("mints a fresh state on every install link", async () => {
        await connect()

        const first = await api.get(
          "/vendors/shopify/connection/install-link",
          {
            headers: vendorHeaders,
          },
        )
        const second = await api.get(
          "/vendors/shopify/connection/install-link",
          { headers: vendorHeaders },
        )

        const stateOf = (url: string) => new URL(url).searchParams.get("state")

        expect(stateOf(first.data.install_link)).not.toBe(
          stateOf(second.data.install_link),
        )
      })
    })
  },
})
