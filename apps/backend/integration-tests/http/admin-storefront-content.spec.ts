import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  createCollectionsWorkflow,
  createProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows"
import { createAdminUserWorkflow } from "../../src/workflows/create-admin-user"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("storefront content on collections and categories", () => {
      let adminHeaders: { Authorization: string }
      let collectionId: string
      let categoryId: string

      const setCollectionContent = (body: unknown, id = collectionId) =>
        api.post(`/admin/collections/${id}/storefront-content`, body, {
          headers: adminHeaders,
        })

      const setCategoryContent = (body: unknown, id = categoryId) =>
        api.post(`/admin/product-categories/${id}/storefront-content`, body, {
          headers: adminHeaders,
        })

      beforeAll(async () => {
        const container = getContainer()

        await createAdminUserWorkflow(container).run({
          input: {
            email: "storefront-content@test.com",
            password: "test1234",
            first_name: "Content",
          },
        })
        const login = await api.post("/auth/user/emailpass", {
          email: "storefront-content@test.com",
          password: "test1234",
        })
        adminHeaders = { Authorization: `Bearer ${login.data.token}` }

        const { result: collections } = await createCollectionsWorkflow(
          container,
        ).run({
          input: {
            collections: [{ title: "Summer", handle: "summer-content" }],
          },
        })
        collectionId = collections[0].id

        const { result: categories } = await createProductCategoriesWorkflow(
          container,
        ).run({
          input: {
            product_categories: [{ name: "Jackets", is_active: true }],
          },
        })
        categoryId = categories[0].id
      })

      it("rejects an unauthenticated write", async () => {
        await expect(
          api.post(`/admin/collections/${collectionId}/storefront-content`, {
            name: "Hacked",
          }),
        ).rejects.toMatchObject({ response: { status: 401 } })
      })

      it("stores storefront copy for a collection", async () => {
        const response = await setCollectionContent({
          name: "Summer Drop",
          description: "Warm weather picks",
          hero_image_url: "https://cdn.example.com/summer.jpg",
        })

        expect(response.status).toBe(200)
        expect(response.data.storefront_content).toMatchObject({
          name: "Summer Drop",
          description: "Warm weather picks",
          hero_image_url: "https://cdn.example.com/summer.jpg",
        })
      })

      it("stores storefront copy for a product category", async () => {
        const response = await setCategoryContent({ name: "Outerwear" })

        expect(response.status).toBe(200)
        expect(response.data.storefront_content.name).toBe("Outerwear")
      })

      it("keeps a collection's and a category's content independent", async () => {
        await setCollectionContent({ name: "Collection Copy" })
        await setCategoryContent({ name: "Category Copy" })

        const collectionAgain = await setCollectionContent({})
        expect(collectionAgain.data.storefront_content.name).toBe(
          "Collection Copy",
        )
      })

      it("updates existing copy instead of creating a second record", async () => {
        await setCollectionContent({ name: "First Name" })
        const second = await setCollectionContent({ name: "Second Name" })

        expect(second.data.storefront_content.name).toBe("Second Name")
      })

      it("leaves untouched fields alone on a partial update", async () => {
        await setCollectionContent({
          name: "Keep Me",
          description: "Keep this too",
        })

        const response = await setCollectionContent({ name: "New Name Only" })

        expect(response.data.storefront_content).toMatchObject({
          name: "New Name Only",
          description: "Keep this too",
        })
      })

      it("ignores a blank name rather than wiping the stored one", async () => {
        await setCollectionContent({ name: "Real Name" })

        const response = await setCollectionContent({ name: "   " })

        expect(response.data.storefront_content.name).toBe("Real Name")
      })

      it("rejects an unknown field", async () => {
        await expect(
          setCollectionContent({ name: "Fine", slug: "not-a-field" }),
        ).rejects.toMatchObject({ response: { status: 400 } })
      })

      it("fails cleanly for a collection that does not exist", async () => {
        await expect(
          setCollectionContent({ name: "Ghost" }, "pcol_does_not_exist"),
        ).rejects.toMatchObject({ response: { status: 404 } })
      })

      it("fails cleanly for a category that does not exist", async () => {
        await expect(
          setCategoryContent({ name: "Ghost" }, "pcat_does_not_exist"),
        ).rejects.toMatchObject({ response: { status: 404 } })
      })
    })
  },
})
