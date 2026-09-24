import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/vendor-users/create-vendor-user"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/vendors/product-categories", () => {
      let vendorToken: string

      beforeAll(async () => {
        const container = getContainer()

        await createProductCategoriesWorkflow(container).run({
          input: {
            product_categories: [
              { name: "Outerwear", is_active: true },
              { name: "Footwear", is_active: true },
            ],
          },
        })

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name: "Categories Test Vendor" },
        })

        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: vendor.id,
            email: "categories-test@test.com",
            password: "test1234",
            name: "Categories",
          },
        })

        const login = await api.post("/auth/vendor/emailpass", {
          email: "categories-test@test.com",
          password: "test1234",
        })
        vendorToken = login.data.token
      })

      it("rejects an unauthenticated request", async () => {
        await expect(
          api.get("/vendors/product-categories"),
        ).rejects.toMatchObject({ response: { status: 401 } })
      })

      it("returns the categories a vendor can assign products to", async () => {
        const response = await api.get("/vendors/product-categories", {
          headers: { Authorization: `Bearer ${vendorToken}` },
        })

        expect(response.status).toBe(200)

        const names = response.data.product_categories.map(
          (category: { name: string }) => category.name,
        )
        expect(names).toEqual(expect.arrayContaining(["Outerwear", "Footwear"]))

        for (const category of response.data.product_categories) {
          expect(Object.keys(category).sort()).toEqual(["handle", "id", "name"])
        }
      })
    })
  },
})
