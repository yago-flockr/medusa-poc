import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createAdminUserWorkflow } from "../../src/workflows/create-admin-user"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/store/vendors", () => {
      let adminHeaders: { Authorization: string }
      let publishableKeyHeaders: { "x-publishable-api-key": string }
      let activeVendorId: string
      let inactiveVendorId: string

      beforeAll(async () => {
        const container = getContainer()

        await createAdminUserWorkflow(container).run({
          input: {
            email: "store-vendors@test.com",
            password: "test1234",
            first_name: "Store",
          },
        })

        const login = await api.post("/auth/user/emailpass", {
          email: "store-vendors@test.com",
          password: "test1234",
        })
        adminHeaders = { Authorization: `Bearer ${login.data.token}` }

        const apiKey = await api.post(
          "/admin/api-keys",
          { title: "Storefront", type: "publishable" },
          { headers: adminHeaders },
        )
        publishableKeyHeaders = {
          "x-publishable-api-key": apiKey.data.api_key.token,
        }

        const { result: active } = await createVendorWorkflow(container).run({
          input: { name: "Visible Vendor" },
        })
        activeVendorId = active.id

        const { result: inactive } = await createVendorWorkflow(container).run({
          input: { name: "Hidden Vendor" },
        })
        inactiveVendorId = inactive.id

        await api.post(
          `/admin/vendors/${inactiveVendorId}`,
          { is_active: false },
          { headers: adminHeaders },
        )
      })

      it("lists active vendors to the public storefront", async () => {
        const response = await api.get("/store/vendors", {
          headers: publishableKeyHeaders,
        })

        expect(response.status).toBe(200)
        expect(
          response.data.vendors.some(
            (vendor: { id: string }) => vendor.id === activeVendorId,
          ),
        ).toBe(true)
      })

      it("never exposes a deactivated vendor", async () => {
        const response = await api.get("/store/vendors", {
          headers: publishableKeyHeaders,
        })

        expect(
          response.data.vendors.some(
            (vendor: { id: string }) => vendor.id === inactiveVendorId,
          ),
        ).toBe(false)
      })

      it("never exposes vendor users to the storefront", async () => {
        const response = await api.get("/store/vendors", {
          headers: publishableKeyHeaders,
        })

        for (const vendor of response.data.vendors) {
          expect(vendor).not.toHaveProperty("users")
        }
      })
    })
  },
})
