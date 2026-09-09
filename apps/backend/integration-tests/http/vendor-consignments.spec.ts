import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  createOrderWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { createVendorWorkflow } from "../../src/workflows/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/create-vendor-user"
import { VENDOR_MODULE } from "../../src/modules/vendor"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/vendors/orders", () => {
      let vendorToken: string
      let otherVendorToken: string
      let consignmentId: string

      async function createConsignmentFixture(vendorId: string) {
        const container = getContainer()

        const { result: region } = await createRegionsWorkflow(container).run({
          input: {
            regions: [
              { name: "Test Region", currency_code: "gbp", countries: ["gb"] },
            ],
          },
        })
        const { result: salesChannel } = await createSalesChannelsWorkflow(
          container,
        ).run({
          input: { salesChannelsData: [{ name: "Test Channel" }] },
        })

        const { result: order } = await createOrderWorkflow(container).run({
          input: {
            region_id: region[0].id,
            sales_channel_id: salesChannel[0].id,
            email: "customer@test.com",
            currency_code: "gbp",
            items: [{ title: "Test Item", quantity: 1, unit_price: 20 }],
            shipping_address: {
              first_name: "Jane",
              last_name: "Doe",
              address_1: "1 Test St",
              city: "London",
              country_code: "gb",
              postal_code: "E1 6AN",
            },
          } as never,
        })

        const vendorModuleService = container.resolve(VENDOR_MODULE)
        const [consignment] = await vendorModuleService.createConsignments([
          { vendor_id: vendorId, status: "placed" },
        ])

        const linkModule = container.resolve("remoteLink")
        await linkModule.create([
          {
            [VENDOR_MODULE]: { consignment_id: consignment.id },
            [Modules.ORDER]: { order_id: order.id },
          },
          {
            [Modules.ORDER]: { order_line_item_id: order.items![0].id },
            [VENDOR_MODULE]: { consignment_id: consignment.id },
          },
        ])

        return consignment.id
      }

      beforeAll(async () => {
        const container = getContainer()

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name: "Orders Test Vendor" },
        })
        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: vendor.id,
            email: "orders-test@test.com",
            password: "test1234",
            first_name: "Orders",
          },
        })

        const { result: otherVendor } = await createVendorWorkflow(
          container,
        ).run({
          input: { name: "Other Orders Vendor" },
        })
        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: otherVendor.id,
            email: "orders-other@test.com",
            password: "test1234",
            first_name: "Other",
          },
        })

        const login = await api.post("/auth/vendor/emailpass", {
          email: "orders-test@test.com",
          password: "test1234",
        })
        vendorToken = login.data.token

        const otherLogin = await api.post("/auth/vendor/emailpass", {
          email: "orders-other@test.com",
          password: "test1234",
        })
        otherVendorToken = otherLogin.data.token

        consignmentId = await createConsignmentFixture(vendor.id)
      })

      it("rejects an unauthenticated request", async () => {
        await expect(api.get("/vendors/orders")).rejects.toMatchObject({
          response: { status: 401 },
        })
      })

      it("lists the vendor's own order", async () => {
        const response = await api.get("/vendors/orders", {
          headers: { Authorization: `Bearer ${vendorToken}` },
        })

        expect(response.data.count).toBe(1)
        expect(response.data.orders[0]).toMatchObject({
          id: consignmentId,
          consignment_status: "placed",
          total: 20,
        })
      })

      it("does not list another vendor's order", async () => {
        const response = await api.get("/vendors/orders", {
          headers: { Authorization: `Bearer ${otherVendorToken}` },
        })

        expect(response.data).toMatchObject({ count: 0, orders: [] })
      })

      it("returns the full order detail for the owning vendor", async () => {
        const response = await api.get(`/vendors/orders/${consignmentId}`, {
          headers: { Authorization: `Bearer ${vendorToken}` },
        })

        expect(response.data).toMatchObject({
          id: consignmentId,
          consignment_status: "placed",
          fulfillment_status: "not_fulfilled",
          total: 20,
          items: [{ title: "Test Item", quantity: 1 }],
        })
      })

      it("rejects another vendor reading the order detail", async () => {
        await expect(
          api.get(`/vendors/orders/${consignmentId}`, {
            headers: { Authorization: `Bearer ${otherVendorToken}` },
          }),
        ).rejects.toMatchObject({ response: { status: 404 } })
      })
    })
  },
})
