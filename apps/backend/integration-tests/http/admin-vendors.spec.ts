import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createAdminUserWorkflow } from "../../src/workflows/create-admin-user"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/admin/vendors", () => {
      let adminHeaders: { Authorization: string }

      const postVendor = (body: Record<string, unknown>) =>
        api.post("/admin/vendors", body, { headers: adminHeaders })

      beforeAll(async () => {
        await createAdminUserWorkflow(getContainer()).run({
          input: {
            email: "admin-vendors@test.com",
            password: "test1234",
            first_name: "Vendors",
          },
        })

        const login = await api.post("/auth/user/emailpass", {
          email: "admin-vendors@test.com",
          password: "test1234",
        })
        adminHeaders = { Authorization: `Bearer ${login.data.token}` }
      })

      it("rejects unauthenticated requests", async () => {
        await expect(api.get("/admin/vendors")).rejects.toMatchObject({
          response: { status: 401 },
        })
        await expect(
          api.post("/admin/vendors", { name: "Nope" }),
        ).rejects.toMatchObject({ response: { status: 401 } })
      })

      it("creates a vendor and derives its handle", async () => {
        const response = await postVendor({ name: "Northern Supply Co" })

        expect(response.status).toBe(200)
        expect(response.data.vendor).toMatchObject({
          name: "Northern Supply Co",
          handle: "northern-supply-co",
          is_active: true,
        })
      })

      it("defaults a new vendor to no commission", async () => {
        const response = await postVendor({ name: "Rateless Vendor" })

        expect(response.data.vendor.commission_rate).toBe(0)
      })

      it("stores the commission rate staff set for a vendor", async () => {
        const created = await postVendor({
          name: "Rated Vendor",
          commission_rate: 0.15,
        })

        expect(created.data.vendor.commission_rate).toBe(0.15)

        const updated = await api.post(
          `/admin/vendors/${created.data.vendor.id}`,
          { commission_rate: 0.3 },
          { headers: adminHeaders },
        )

        expect(updated.data.vendor.commission_rate).toBe(0.3)
      })

      it("refuses a commission rate above a whole share of the sale", async () => {
        await expect(
          postVendor({ name: "Greedy Vendor", commission_rate: 1.5 }),
        ).rejects.toMatchObject({ response: { status: 400 } })
      })

      it("lists created vendors", async () => {
        await postVendor({ name: "Listed Vendor" })

        const response = await api.get("/admin/vendors", {
          headers: adminHeaders,
        })

        expect(response.status).toBe(200)
        expect(
          response.data.vendors.some(
            (vendor: { name: string }) => vendor.name === "Listed Vendor",
          ),
        ).toBe(true)
      })

      it("returns a single vendor by id", async () => {
        const created = await postVendor({ name: "Readable Vendor" })

        const response = await api.get(
          `/admin/vendors/${created.data.vendor.id}`,
          { headers: adminHeaders },
        )

        expect(response.status).toBe(200)
        expect(response.data.vendor).toMatchObject({
          id: created.data.vendor.id,
          name: "Readable Vendor",
        })
      })

      it("updates a vendor", async () => {
        const created = await postVendor({ name: "Before Rename" })

        const response = await api.post(
          `/admin/vendors/${created.data.vendor.id}`,
          { name: "After Rename" },
          { headers: adminHeaders },
        )

        expect(response.status).toBe(200)
        expect(response.data.vendor.name).toBe("After Rename")
      })

      it("stores storefront copy on a vendor", async () => {
        const created = await postVendor({ name: "Storefront Vendor" })

        const response = await api.post(
          `/admin/vendors/${created.data.vendor.id}`,
          {
            storefront_content: {
              name: "Storefront Display Name",
              description: "What shoppers read",
            },
          },
          { headers: adminHeaders },
        )

        expect(response.status).toBe(200)
        expect(response.data.vendor.storefront_content).toMatchObject({
          name: "Storefront Display Name",
          description: "What shoppers read",
        })
      })

      it("keeps the vendor's own name separate from its storefront name", async () => {
        const created = await postVendor({ name: "Legal Entity Ltd" })

        await api.post(
          `/admin/vendors/${created.data.vendor.id}`,
          { storefront_content: { name: "Friendly Shop Name" } },
          { headers: adminHeaders },
        )

        const detail = await api.get(
          `/admin/vendors/${created.data.vendor.id}`,
          { headers: adminHeaders },
        )

        expect(detail.data.vendor.name).toBe("Legal Entity Ltd")
        expect(detail.data.vendor.storefront_content.name).toBe(
          "Friendly Shop Name",
        )
      })

      it("rejects an update that changes nothing", async () => {
        const created = await postVendor({ name: "No Op Vendor" })

        await expect(
          api.post(
            `/admin/vendors/${created.data.vendor.id}`,
            {},
            { headers: adminHeaders },
          ),
        ).rejects.toMatchObject({ response: { status: 400 } })
      })

      it("rejects an unknown field on create", async () => {
        await expect(
          postVendor({ name: "Sneaky Vendor", is_superuser: true }),
        ).rejects.toMatchObject({ response: { status: 400 } })
      })

      it("rejects a vendor with no name", async () => {
        await expect(postVendor({})).rejects.toMatchObject({
          response: { status: 400 },
        })
      })

      it("fails cleanly for a vendor that does not exist", async () => {
        await expect(
          api.get("/admin/vendors/vendor_does_not_exist", {
            headers: adminHeaders,
          }),
        ).rejects.toMatchObject({ response: { status: 404 } })
      })

      it("deletes a vendor", async () => {
        const created = await postVendor({ name: "Doomed Vendor" })

        const response = await api.delete(
          `/admin/vendors/${created.data.vendor.id}`,
          { headers: adminHeaders },
        )

        expect(response.status).toBe(200)
        expect(response.data).toMatchObject({ deleted: true, object: "vendor" })

        await expect(
          api.get(`/admin/vendors/${created.data.vendor.id}`, {
            headers: adminHeaders,
          }),
        ).rejects.toMatchObject({ response: { status: 404 } })
      })
    })
  },
})
