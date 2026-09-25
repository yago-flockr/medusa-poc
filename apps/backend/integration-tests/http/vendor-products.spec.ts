import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/vendor-users/create-vendor-user"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/vendors/products", () => {
      let ownerToken: string
      let otherToken: string
      let outletCategoryId: string
      let internalCategoryId: string

      beforeAll(async () => {
        const container = getContainer()

        const productModule = container.resolve(Modules.PRODUCT)
        const outletCategory = await productModule.createProductCategories({
          name: "Outlet",
          is_active: true,
        })
        outletCategoryId = outletCategory.id
        const internalCategory = await productModule.createProductCategories({
          name: "Staff Only",
          is_active: true,
          is_internal: true,
        })
        internalCategoryId = internalCategory.id

        const { result: owner } = await createVendorWorkflow(container).run({
          input: { name: "Products Owner Vendor" },
        })
        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: owner.id,
            email: "products-owner@test.com",
            password: "test1234",
            name: "Owner",
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
            name: "Other",
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

      const SIZES = ["S", "M", "L"]
      const COLORS = ["Black", "White", "Grey"]

      it.each([
        { shape: "no options", options: [], variantCount: 1 },
        {
          shape: "size",
          options: [{ title: "Size", values: SIZES }],
          variantCount: 3,
        },
        {
          shape: "color",
          options: [{ title: "Color", values: COLORS }],
          variantCount: 3,
        },
        {
          shape: "size and color",
          options: [
            { title: "Size", values: SIZES },
            { title: "Color", values: COLORS },
          ],
          variantCount: 9,
        },
      ])(
        "creates a $shape product with one variant per option combination",
        async ({ shape, options, variantCount }) => {
          const authHeaders = {
            headers: { Authorization: `Bearer ${ownerToken}` },
          }
          const combinations = options.reduce<Record<string, string>[]>(
            (acc, option) =>
              acc.flatMap((combination) =>
                option.values.map((value) => ({
                  ...combination,
                  [option.title]: value,
                })),
              ),
            [{}],
          )
          const skuPrefix = shape.toUpperCase().replace(/\s+/g, "-")

          const created = await api.post(
            "/vendors/products",
            {
              title: `Shape ${shape}`,
              options,
              variants: combinations.map((optionValues, index) => ({
                optionValues,
                price: 20,
                sku: `${skuPrefix}-${index}`,
              })),
            },
            authHeaders,
          )

          const detail = await api.get(
            `/vendors/products/${created.data.product.id}`,
            authHeaders,
          )
          const variants = detail.data.product.variants

          expect(variants).toHaveLength(variantCount)
          expect(
            new Set(variants.map((variant: { sku: string }) => variant.sku)),
          ).toEqual(
            new Set(combinations.map((_, index) => `${skuPrefix}-${index}`)),
          )
        },
      )

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

      it("lists only active, non-internal categories for a vendor to pick from", async () => {
        const ownerHeaders = {
          headers: { Authorization: `Bearer ${ownerToken}` },
        }

        const list = await api.get("/vendors/product-categories", ownerHeaders)
        const ids = list.data.product_categories.map(
          (category: { id: string }) => category.id,
        )
        expect(ids).toContain(outletCategoryId)
        expect(ids).not.toContain(internalCategoryId)
      })

      it("assigns a product to multiple categories on create, and can change them on update", async () => {
        const ownerHeaders = {
          headers: { Authorization: `Bearer ${ownerToken}` },
        }

        const created = await api.post(
          "/vendors/products",
          {
            title: "Categorized Product",
            variants: [{ optionValues: {}, price: 1200, sku: "CAT-SKU" }],
            category_ids: [outletCategoryId],
          },
          ownerHeaders,
        )
        const productId = created.data.product.id

        const detail = await api.get(
          `/vendors/products/${productId}`,
          ownerHeaders,
        )
        expect(detail.data.product.categories).toEqual([
          { id: outletCategoryId, name: "Outlet", handle: expect.any(String) },
        ])

        await api.post(
          `/vendors/products/${productId}`,
          { category_ids: [] },
          ownerHeaders,
        )

        const afterClear = await api.get(
          `/vendors/products/${productId}`,
          ownerHeaders,
        )
        expect(afterClear.data.product.categories).toEqual([])
      })

      it("rejects an update referencing a category that doesn't exist", async () => {
        const ownerHeaders = {
          headers: { Authorization: `Bearer ${ownerToken}` },
        }

        const created = await api.post(
          "/vendors/products",
          {
            title: "Bad Category Product",
            variants: [{ optionValues: {}, price: 900, sku: "BAD-CAT-SKU" }],
          },
          ownerHeaders,
        )
        const productId = created.data.product.id

        await expect(
          api.post(
            `/vendors/products/${productId}`,
            { category_ids: ["pcat_does_not_exist"] },
            ownerHeaders,
          ),
        ).rejects.toMatchObject({ response: { status: 404 } })
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
