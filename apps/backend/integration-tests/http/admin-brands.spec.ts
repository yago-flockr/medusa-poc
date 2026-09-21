import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createAdminUserWorkflow } from "../../src/workflows/create-admin-user"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/admin/brands", () => {
      let adminHeaders: { Authorization: string }

      const postBrand = (body: Record<string, unknown>) =>
        api.post("/admin/brands", body, { headers: adminHeaders })

      beforeAll(async () => {
        await createAdminUserWorkflow(getContainer()).run({
          input: {
            email: "admin-brands@test.com",
            password: "test1234",
            first_name: "Brands",
          },
        })

        const login = await api.post("/auth/user/emailpass", {
          email: "admin-brands@test.com",
          password: "test1234",
        })
        adminHeaders = { Authorization: `Bearer ${login.data.token}` }
      })

      it("rejects unauthenticated requests", async () => {
        await expect(api.get("/admin/brands")).rejects.toMatchObject({
          response: { status: 401 },
        })
      })

      it("rejects a brand without a name", async () => {
        await expect(postBrand({})).rejects.toMatchObject({
          response: { status: 400 },
        })
      })

      it("creates a brand and derives its handle", async () => {
        const response = await postBrand({ name: "Acme Originals" })

        expect(response.status).toBe(200)
        expect(response.data.brand).toMatchObject({
          name: "Acme Originals",
          handle: "acme-originals",
        })
      })

      it("lists, reads, updates and deletes a brand", async () => {
        const created = await postBrand({ name: "Lifecycle Brand" })
        const id = created.data.brand.id

        const list = await api.get("/admin/brands", { headers: adminHeaders })
        expect(
          list.data.brands.some((brand: { id: string }) => brand.id === id),
        ).toBe(true)

        const detail = await api.get(`/admin/brands/${id}`, {
          headers: adminHeaders,
        })
        expect(detail.data.brand).toMatchObject({ id, name: "Lifecycle Brand" })

        const updated = await api.post(
          `/admin/brands/${id}`,
          { name: "Renamed Brand" },
          { headers: adminHeaders },
        )
        expect(updated.data.brand.name).toBe("Renamed Brand")

        const deleted = await api.delete(`/admin/brands/${id}`, {
          headers: adminHeaders,
        })
        expect(deleted.data).toMatchObject({ deleted: true })

        await expect(
          api.get(`/admin/brands/${id}`, { headers: adminHeaders }),
        ).rejects.toMatchObject({ response: { status: 404 } })
      })
    })
  },
})
