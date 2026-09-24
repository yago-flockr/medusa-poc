import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createAdminUserWorkflow } from "../../src/workflows/create-admin-user"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/vendor-users/create-vendor-user"

jest.setTimeout(60000)

const VENDOR_ROUTES = [
  "/vendors/me",
  "/vendors/products",
  "/vendors/orders",
  "/vendors/regions",
  "/vendors/stock-locations",
  "/vendors/product-categories",
]

const ADMIN_ROUTES = [
  "/admin/vendors",
  "/admin/vendor-users",
  "/admin/brands",
  "/admin/affiliates",
]

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("actor boundaries", () => {
      let adminToken: string
      let vendorToken: string

      const bearer = (token: string) => ({
        headers: { Authorization: `Bearer ${token}` },
      })

      beforeAll(async () => {
        const container = getContainer()

        await createAdminUserWorkflow(container).run({
          input: {
            email: "boundaries-admin@test.com",
            password: "test1234",
            first_name: "Boundary",
          },
        })
        const adminLogin = await api.post("/auth/user/emailpass", {
          email: "boundaries-admin@test.com",
          password: "test1234",
        })
        adminToken = adminLogin.data.token

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name: "Boundary Vendor" },
        })
        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: vendor.id,
            email: "boundaries-vendor@test.com",
            password: "test1234",
            name: "Boundary",
          },
        })
        const vendorLogin = await api.post("/auth/vendor/emailpass", {
          email: "boundaries-vendor@test.com",
          password: "test1234",
        })
        vendorToken = vendorLogin.data.token
      })

      describe("an admin token cannot act as a vendor", () => {
        it.each(VENDOR_ROUTES)("is rejected on %s", async (route) => {
          await expect(
            api.get(route, bearer(adminToken)),
          ).rejects.toMatchObject({ response: { status: 401 } })
        })
      })

      describe("a vendor token cannot act as staff", () => {
        it.each(ADMIN_ROUTES)("is rejected on %s", async (route) => {
          await expect(
            api.get(route, bearer(vendorToken)),
          ).rejects.toMatchObject({ response: { status: 401 } })
        })

        it("cannot create a vendor", async () => {
          await expect(
            api.post(
              "/admin/vendors",
              { name: "Self Promoted" },
              bearer(vendorToken),
            ),
          ).rejects.toMatchObject({ response: { status: 401 } })
        })

        it("cannot mint itself a new vendor user", async () => {
          await expect(
            api.post(
              "/admin/vendor-users",
              { vendor_id: "whatever", email: "x@y.com" },
              bearer(vendorToken),
            ),
          ).rejects.toMatchObject({ response: { status: 401 } })
        })
      })

      describe("malformed credentials", () => {
        it("rejects a garbage bearer token", async () => {
          await expect(
            api.get("/vendors/me", bearer("not-a-jwt")),
          ).rejects.toMatchObject({ response: { status: 401 } })
        })

        it("rejects a structurally valid but tampered token", async () => {
          const [header, payload] = vendorToken.split(".")
          const forged = `${header}.${payload}.forgedsignature`

          await expect(
            api.get("/vendors/me", bearer(forged)),
          ).rejects.toMatchObject({ response: { status: 401 } })
        })

        it("rejects an empty bearer token", async () => {
          await expect(
            api.get("/vendors/me", bearer("")),
          ).rejects.toMatchObject({ response: { status: 401 } })
        })

        it("rejects a token passed without the Bearer scheme", async () => {
          await expect(
            api.get("/vendors/me", { headers: { Authorization: vendorToken } }),
          ).rejects.toMatchObject({ response: { status: 401 } })
        })
      })

      describe("login attempts", () => {
        it("rejects a vendor login with the wrong password", async () => {
          await expect(
            api.post("/auth/vendor/emailpass", {
              email: "boundaries-vendor@test.com",
              password: "wrong-password",
            }),
          ).rejects.toMatchObject({ response: { status: 401 } })
        })

        it("rejects a vendor login for an unknown email", async () => {
          await expect(
            api.post("/auth/vendor/emailpass", {
              email: "nobody@test.com",
              password: "test1234",
            }),
          ).rejects.toMatchObject({ response: { status: 401 } })
        })

        // Medusa authenticates the shared auth identity, so posting vendor
        // credentials to the admin actor answers 200 with an actor-less token.
        // What must hold is that the token opens nothing.
        it("gives a vendor no admin access when logging in through the admin actor", async () => {
          const crossLogin = await api.post("/auth/user/emailpass", {
            email: "boundaries-vendor@test.com",
            password: "test1234",
          })

          for (const route of ADMIN_ROUTES) {
            await expect(
              api.get(route, bearer(crossLogin.data.token)),
            ).rejects.toMatchObject({ response: { status: 401 } })
          }

          await expect(
            api.post(
              "/admin/vendors",
              { name: "Escalated" },
              bearer(crossLogin.data.token),
            ),
          ).rejects.toMatchObject({ response: { status: 401 } })
        })

        it("gives an admin no vendor access when logging in through the vendor actor", async () => {
          const crossLogin = await api.post("/auth/vendor/emailpass", {
            email: "boundaries-admin@test.com",
            password: "test1234",
          })

          for (const route of VENDOR_ROUTES) {
            await expect(
              api.get(route, bearer(crossLogin.data.token)),
            ).rejects.toMatchObject({ response: { status: 401 } })
          }
        })
      })
    })
  },
})
