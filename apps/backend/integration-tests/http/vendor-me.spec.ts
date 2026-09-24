import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/vendor-users/create-vendor-user"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/vendors/me", () => {
      let vendorToken: string
      let vendorId: string

      beforeAll(async () => {
        const container = getContainer()

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name: "Me Test Vendor" },
        })
        vendorId = vendor.id

        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: vendor.id,
            email: "me-test@test.com",
            password: "test1234",
            name: "Me Tester",
          },
        })

        const login = await api.post("/auth/vendor/emailpass", {
          email: "me-test@test.com",
          password: "test1234",
        })
        vendorToken = login.data.token
      })

      it("rejects an unauthenticated request", async () => {
        await expect(api.get("/vendors/me")).rejects.toMatchObject({
          response: { status: 401 },
        })
      })

      it("returns the signed-in vendor user and their vendor", async () => {
        const response = await api.get("/vendors/me", {
          headers: { Authorization: `Bearer ${vendorToken}` },
        })

        expect(response.status).toBe(200)
        expect(response.data.vendor_user).toMatchObject({
          email: "me-test@test.com",
          name: "Me Tester",
        })
        expect(response.data.vendor).toMatchObject({
          id: vendorId,
          name: "Me Test Vendor",
        })
      })

      it("never exposes the vendor user password", async () => {
        const response = await api.get("/vendors/me", {
          headers: { Authorization: `Bearer ${vendorToken}` },
        })

        expect(response.data.vendor_user).not.toHaveProperty("password")
        expect(JSON.stringify(response.data)).not.toContain("test1234")
      })

      it("updates the signed-in vendor user's own name", async () => {
        const response = await api.patch(
          "/vendors/me",
          { name: "Renamed Person" },
          { headers: { Authorization: `Bearer ${vendorToken}` } },
        )

        expect(response.status).toBe(200)

        const after = await api.get("/vendors/me", {
          headers: { Authorization: `Bearer ${vendorToken}` },
        })
        expect(after.data.vendor_user).toMatchObject({
          name: "Renamed Person",
        })
      })
    })
  },
})
