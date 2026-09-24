import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/vendor-users/create-vendor-user"

jest.setTimeout(60000)

const ADDRESS = {
  address_1: "1 Test St",
  city: "London",
  province: "London",
  postal_code: "E1 6AN",
  country_code: "gb",
}

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/vendors/stock-locations", () => {
      let ownerToken: string
      let otherToken: string

      beforeAll(async () => {
        const container = getContainer()

        const { result: owner } = await createVendorWorkflow(container).run({
          input: { name: "Owner Vendor" },
        })
        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: owner.id,
            email: "owner@test.com",
            password: "test1234",
            name: "Owner",
          },
        })

        const { result: other } = await createVendorWorkflow(container).run({
          input: { name: "Other Vendor" },
        })
        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: other.id,
            email: "other@test.com",
            password: "test1234",
            name: "Other",
          },
        })

        const ownerLogin = await api.post("/auth/vendor/emailpass", {
          email: "owner@test.com",
          password: "test1234",
        })
        ownerToken = ownerLogin.data.token

        const otherLogin = await api.post("/auth/vendor/emailpass", {
          email: "other@test.com",
          password: "test1234",
        })
        otherToken = otherLogin.data.token
      })

      it("rejects an unauthenticated request", async () => {
        await expect(api.get("/vendors/stock-locations")).rejects.toMatchObject(
          {
            response: { status: 401 },
          },
        )
      })

      it("starts with no stock locations for a new vendor", async () => {
        const response = await api.get("/vendors/stock-locations", {
          headers: { Authorization: `Bearer ${ownerToken}` },
        })
        expect(response.data).toMatchObject({ count: 0, stock_locations: [] })
      })

      it("full create -> list -> update -> cross-vendor reject -> delete lifecycle", async () => {
        const authHeaders = {
          headers: { Authorization: `Bearer ${ownerToken}` },
        }

        const created = await api.post(
          "/vendors/stock-locations",
          { name: "Owner Warehouse", address: ADDRESS },
          authHeaders,
        )
        expect(created.status).toBe(200)
        expect(created.data.stock_location).toMatchObject({
          name: "Owner Warehouse",
          address: { ...ADDRESS, address_2: null, phone: null },
        })
        const locationId = created.data.stock_location.id

        const list = await api.get("/vendors/stock-locations", authHeaders)
        expect(list.data.count).toBe(1)
        expect(list.data.stock_locations[0].id).toBe(locationId)

        // Regression: update used to drop the address down to just `.id`.
        const updated = await api.post(
          `/vendors/stock-locations/${locationId}`,
          { name: "Owner Warehouse Renamed" },
          authHeaders,
        )
        expect(updated.data.stock_location).toMatchObject({
          name: "Owner Warehouse Renamed",
          address: { ...ADDRESS, address_2: null, phone: null },
        })

        const otherHeaders = {
          headers: { Authorization: `Bearer ${otherToken}` },
        }

        await expect(
          api.post(
            `/vendors/stock-locations/${locationId}`,
            { name: "Hijacked" },
            otherHeaders,
          ),
        ).rejects.toMatchObject({ response: { status: 404 } })

        await expect(
          api.delete(`/vendors/stock-locations/${locationId}`, otherHeaders),
        ).rejects.toMatchObject({ response: { status: 404 } })

        const deleted = await api.delete(
          `/vendors/stock-locations/${locationId}`,
          authHeaders,
        )
        expect(deleted.data).toEqual({ id: locationId, deleted: true })

        const listAfterDelete = await api.get(
          "/vendors/stock-locations",
          authHeaders,
        )
        expect(listAfterDelete.data.count).toBe(0)
      })
    })
  },
})
