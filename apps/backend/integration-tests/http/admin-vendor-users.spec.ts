import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createAdminUserWorkflow } from "../../src/workflows/create-admin-user"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/admin/vendor-users", () => {
      let adminHeaders: { Authorization: string }
      let vendorId: string
      let emailCounter = 0

      const createVendorUser = async () => {
        emailCounter += 1
        const email = `vendor-user-${emailCounter}@test.com`

        const response = await api.post(
          "/admin/vendor-users",
          { vendor_id: vendorId, email, name: "Staff" },
          { headers: adminHeaders },
        )

        return { email, response }
      }

      const login = (email: string, password: string) =>
        api.post("/auth/vendor/emailpass", { email, password })

      beforeAll(async () => {
        const container = getContainer()

        await createAdminUserWorkflow(container).run({
          input: {
            email: "admin-vendor-users@test.com",
            password: "test1234",
            first_name: "Admin",
          },
        })

        const adminLogin = await api.post("/auth/user/emailpass", {
          email: "admin-vendor-users@test.com",
          password: "test1234",
        })
        adminHeaders = { Authorization: `Bearer ${adminLogin.data.token}` }

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name: "Vendor Users Host" },
        })
        vendorId = vendor.id
      })

      it("rejects unauthenticated requests", async () => {
        await expect(api.get("/admin/vendor-users")).rejects.toMatchObject({
          response: { status: 401 },
        })
      })

      it("returns a generated password the vendor user can log in with", async () => {
        const { email, response } = await createVendorUser()

        expect(response.status).toBe(200)
        expect(response.data.password).toEqual(expect.any(String))
        expect(response.data.password.length).toBeGreaterThan(0)

        const vendorLogin = await login(email, response.data.password)
        expect(vendorLogin.status).toBe(200)
        expect(vendorLogin.data.token).toEqual(expect.any(String))
      })

      it("lists and reads back a created vendor user", async () => {
        const { email, response } = await createVendorUser()
        const id = response.data.vendor_user.id

        const list = await api.get("/admin/vendor-users", {
          headers: adminHeaders,
        })
        expect(
          list.data.vendor_users.some((user: { id: string }) => user.id === id),
        ).toBe(true)

        const detail = await api.get(`/admin/vendor-users/${id}`, {
          headers: adminHeaders,
        })
        expect(detail.data.vendor_user).toMatchObject({ id, email })
      })

      it("updates a vendor user's name", async () => {
        const { response } = await createVendorUser()

        const updated = await api.post(
          `/admin/vendor-users/${response.data.vendor_user.id}`,
          { name: "Updated" },
          { headers: adminHeaders },
        )

        expect(updated.status).toBe(200)
        expect(updated.data.vendor_user.name).toBe("Updated")
      })

      it("regenerates a password and retires the previous one", async () => {
        const { email, response } = await createVendorUser()
        const originalPassword = response.data.password

        const regenerated = await api.post(
          `/admin/vendor-users/${response.data.vendor_user.id}/regenerate-password`,
          {},
          { headers: adminHeaders },
        )

        expect(regenerated.status).toBe(200)
        expect(regenerated.data.password).not.toBe(originalPassword)

        const withNewPassword = await login(email, regenerated.data.password)
        expect(withNewPassword.status).toBe(200)

        await expect(login(email, originalPassword)).rejects.toMatchObject({
          response: { status: 401 },
        })
      })

      it("deletes a vendor user and cuts off their access to vendor data", async () => {
        const { email, response } = await createVendorUser()
        const password = response.data.password
        const tokenBeforeDelete = (await login(email, password)).data.token

        const deleted = await api.delete(
          `/admin/vendor-users/${response.data.vendor_user.id}`,
          { headers: adminHeaders },
        )

        expect(deleted.status).toBe(200)
        expect(deleted.data).toMatchObject({
          deleted: true,
          object: "vendor_user",
        })

        await expect(
          api.get("/vendors/me", {
            headers: { Authorization: `Bearer ${tokenBeforeDelete}` },
          }),
        ).rejects.toMatchObject({ response: {} })

        await expect(
          api.get("/vendors/products", {
            headers: { Authorization: `Bearer ${tokenBeforeDelete}` },
          }),
        ).rejects.toMatchObject({ response: {} })
      })
    })
  },
})
