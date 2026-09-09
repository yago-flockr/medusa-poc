import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createVendorWorkflow } from "../../src/workflows/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/create-vendor-user"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/vendors/orders", () => {
      let vendorToken: string

      beforeAll(async () => {
        const container = getContainer()

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name: "Orders Test Vendor" },
        })

        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: vendor.id,
            email: "orders-test@test.com",
            password: "test1234",
            first_name: "Orders",
          },
        })

        const login = await api.post("/auth/vendor/emailpass", {
          email: "orders-test@test.com",
          password: "test1234",
        })
        vendorToken = login.data.token
      })

      it("rejects an unauthenticated request", async () => {
        await expect(api.get("/vendors/orders")).rejects.toMatchObject({
          response: { status: 401 },
        })
      })

      it("starts with no orders for a new vendor", async () => {
        const response = await api.get("/vendors/orders", {
          headers: { Authorization: `Bearer ${vendorToken}` },
        })

        expect(response.data).toMatchObject({ count: 0, orders: [] })
      })
    })
  },
})
