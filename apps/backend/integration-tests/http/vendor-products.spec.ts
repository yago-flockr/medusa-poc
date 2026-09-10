import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/vendor-users/create-vendor-user"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/vendors/products", () => {
      let ownerToken: string
      let otherToken: string

      beforeAll(async () => {
        const container = getContainer()

        const { result: owner } = await createVendorWorkflow(container).run({
          input: { name: "Products Owner Vendor" },
        })
        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: owner.id,
            email: "products-owner@test.com",
            password: "test1234",
            first_name: "Owner",
          },
        })

        const { result: other } = await createVendorWorkflow(container).run({
          input: { name: "Products Other Vendor" },
        })
        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: other.id,
            email: "products-other@test.com",
            password: "test1234",
            first_name: "Other",
          },
        })

        const ownerLogin = await api.post("/auth/vendor/emailpass", {
          email: "products-owner@test.com",
          password: "test1234",
        })
        ownerToken = ownerLogin.data.token

        const otherLogin = await api.post("/auth/vendor/emailpass", {
          email: "products-other@test.com",
          password: "test1234",
        })
        otherToken = otherLogin.data.token
      })

      it("rejects an unauthenticated request", async () => {
        await expect(api.get("/vendors/products")).rejects.toMatchObject({
          response: { status: 401 },
        })
      })

      it("full create -> list -> get lifecycle", async () => {
        const authHeaders = {
          headers: { Authorization: `Bearer ${ownerToken}` },
        }

        const created = await api.post(
          "/vendors/products",
          {
            title: "Owner Product",
            variants: [{ optionValues: {}, price: 1000, sku: "OWNER-SKU" }],
          },
          authHeaders,
        )
        expect(created.status).toBe(200)
        expect(created.data.product.title).toBe("Owner Product")
        const productId = created.data.product.id

        const list = await api.get("/vendors/products", authHeaders)
        expect(list.data.count).toBeGreaterThanOrEqual(1)

        const detail = await api.get(
          `/vendors/products/${productId}`,
          authHeaders,
        )
        expect(detail.data.product.variants).toHaveLength(1)
        expect(detail.data.product.variants[0].sku).toBe("OWNER-SKU")
      })

      it("rejects a cross-vendor variant id smuggled into an update payload", async () => {
        const ownerHeaders = {
          headers: { Authorization: `Bearer ${ownerToken}` },
        }
        const otherHeaders = {
          headers: { Authorization: `Bearer ${otherToken}` },
        }

        const ownerProduct = await api.post(
          "/vendors/products",
          {
            title: "Owner Attack Target",
            variants: [
              { optionValues: {}, price: 1000, sku: "OWNER-ATTACK-SKU" },
            ],
          },
          ownerHeaders,
        )
        const ownerProductId = ownerProduct.data.product.id
        const ownerVariantId = (
          await api.get(`/vendors/products/${ownerProductId}`, ownerHeaders)
        ).data.product.variants[0].id

        const attackerProduct = await api.post(
          "/vendors/products",
          {
            title: "Attacker's Own Product",
            variants: [{ optionValues: {}, price: 500, sku: "ATTACKER-SKU" }],
          },
          otherHeaders,
        )
        const attackerProductId = attackerProduct.data.product.id

        // Regression: an attacker could smuggle another vendor's real variant
        // id into an update on their OWN product and silently overwrite it.
        await expect(
          api.post(
            `/vendors/products/${attackerProductId}`,
            { variants: [{ id: ownerVariantId, sku: "HACKED", price: 1 }] },
            otherHeaders,
          ),
        ).rejects.toMatchObject({ response: { status: 404 } })

        const ownerDetailAfter = await api.get(
          `/vendors/products/${ownerProductId}`,
          ownerHeaders,
        )
        expect(ownerDetailAfter.data.product.variants[0].sku).toBe(
          "OWNER-ATTACK-SKU",
        )
        expect(ownerDetailAfter.data.product.variants[0].price).toBe(1000)
      })

      it("rejects cross-vendor get/update/delete on a product", async () => {
        const ownerHeaders = {
          headers: { Authorization: `Bearer ${ownerToken}` },
        }
        const otherHeaders = {
          headers: { Authorization: `Bearer ${otherToken}` },
        }

        const created = await api.post(
          "/vendors/products",
          {
            title: "Owner Only Product",
            variants: [{ optionValues: {}, price: 700, sku: "OWNER-ONLY" }],
          },
          ownerHeaders,
        )
        const productId = created.data.product.id

        await expect(
          api.get(`/vendors/products/${productId}`, otherHeaders),
        ).rejects.toMatchObject({ response: { status: 404 } })

        await expect(
          api.post(
            `/vendors/products/${productId}`,
            { title: "Hijacked" },
            otherHeaders,
          ),
        ).rejects.toMatchObject({ response: { status: 404 } })

        await expect(
          api.delete(`/vendors/products/${productId}`, otherHeaders),
        ).rejects.toMatchObject({ response: { status: 404 } })
      })
    })
  },
})
