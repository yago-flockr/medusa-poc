import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createRegionsWorkflow } from "@medusajs/medusa/core-flows"
import { createVendorWorkflow } from "../../src/workflows/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/create-vendor-user"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/vendors/regions", () => {
      let vendorToken: string

      beforeAll(async () => {
        const container = getContainer()

        await createRegionsWorkflow(container).run({
          input: {
            regions: [
              { name: "Europe", currency_code: "eur", countries: ["gb", "fr"] },
            ],
          },
        })

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name: "Regions Test Vendor" },
        })

        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: vendor.id,
            email: "regions-test@test.com",
            password: "test1234",
            first_name: "Regions",
          },
        })

        const login = await api.post("/auth/vendor/emailpass", {
          email: "regions-test@test.com",
          password: "test1234",
        })
        vendorToken = login.data.token
      })

      it("rejects an unauthenticated request", async () => {
        await expect(api.get("/vendors/regions")).rejects.toMatchObject({
          response: { status: 401 },
        })
      })

      it("returns deduped, sorted countries across all regions", async () => {
        const response = await api.get("/vendors/regions", {
          headers: { Authorization: `Bearer ${vendorToken}` },
        })

        expect(response.status).toBe(200)
        expect(response.data.countries).toEqual([
          { iso_2: "fr", display_name: "France" },
          { iso_2: "gb", display_name: "United Kingdom" },
        ])
      })
    })
  },
})
