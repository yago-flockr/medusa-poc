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

type VendorFixture = {
  headers: { Authorization: string }
  productId: string
  variantId: string
  locationId: string
}

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/vendors/products/:id/inventory", () => {
      let owner: VendorFixture
      let intruder: VendorFixture

      const setInventory = (
        vendor: VendorFixture,
        body: Record<string, unknown>,
        productId = vendor.productId,
      ) =>
        api.post(`/vendors/products/${productId}/inventory`, body, {
          headers: vendor.headers,
        })

      async function buildVendor(name: string, email: string) {
        const container = getContainer()

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name },
        })

        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: vendor.id,
            email,
            password: "test1234",
            name: name,
          },
        })

        const login = await api.post("/auth/vendor/emailpass", {
          email,
          password: "test1234",
        })
        const headers = { Authorization: `Bearer ${login.data.token}` }

        const location = await api.post(
          "/vendors/stock-locations",
          { name: `${name} Warehouse`, address: ADDRESS },
          { headers },
        )

        const product = await api.post(
          "/vendors/products",
          {
            title: `${name} Product`,
            variants: [{ optionValues: {}, price: 1000 }],
          },
          { headers },
        )

        const detail = await api.get(
          `/vendors/products/${product.data.product.id}`,
          { headers },
        )

        return {
          headers,
          productId: product.data.product.id,
          variantId: detail.data.product.variants[0].id,
          locationId: location.data.stock_location.id,
        }
      }

      beforeAll(async () => {
        owner = await buildVendor("Owner", "inventory-owner@test.com")
        intruder = await buildVendor("Intruder", "inventory-intruder@test.com")
      })

      it("rejects an unauthenticated request", async () => {
        await expect(
          api.get(`/vendors/products/${owner.productId}/inventory`),
        ).rejects.toMatchObject({ response: { status: 401 } })
      })

      it("starts a new product with no stocked quantity", async () => {
        const response = await api.get(
          `/vendors/products/${owner.productId}/inventory`,
          { headers: owner.headers },
        )

        expect(response.status).toBe(200)
        expect(response.data.variants).toHaveLength(1)
        expect(response.data.locations.length).toBeGreaterThanOrEqual(1)
      })

      it("books stock into the vendor's own location", async () => {
        const response = await setInventory(owner, {
          variant_id: owner.variantId,
          location_id: owner.locationId,
          quantity: 12,
        })

        expect(response.status).toBe(200)

        const level = response.data.variants[0].levels.find(
          (candidate: { location_id: string }) =>
            candidate.location_id === owner.locationId,
        )
        expect(level.quantity).toBe(12)
      })

      it("overwrites an existing quantity rather than adding to it", async () => {
        await setInventory(owner, {
          variant_id: owner.variantId,
          location_id: owner.locationId,
          quantity: 5,
        })
        const response = await setInventory(owner, {
          variant_id: owner.variantId,
          location_id: owner.locationId,
          quantity: 3,
        })

        const level = response.data.variants[0].levels.find(
          (candidate: { location_id: string }) =>
            candidate.location_id === owner.locationId,
        )
        expect(level.quantity).toBe(3)
      })

      it("accepts zero as a deliberate sell-out", async () => {
        const response = await setInventory(owner, {
          variant_id: owner.variantId,
          location_id: owner.locationId,
          quantity: 0,
        })

        expect(response.status).toBe(200)
      })

      describe("input a vendor should not get away with", () => {
        it("rejects a negative quantity", async () => {
          await expect(
            setInventory(owner, {
              variant_id: owner.variantId,
              location_id: owner.locationId,
              quantity: -5,
            }),
          ).rejects.toMatchObject({ response: { status: 400 } })
        })

        it("rejects a fractional quantity", async () => {
          await expect(
            setInventory(owner, {
              variant_id: owner.variantId,
              location_id: owner.locationId,
              quantity: 1.5,
            }),
          ).rejects.toMatchObject({ response: { status: 400 } })
        })

        it("rejects a quantity sent as a string", async () => {
          await expect(
            setInventory(owner, {
              variant_id: owner.variantId,
              location_id: owner.locationId,
              quantity: "10",
            }),
          ).rejects.toMatchObject({ response: { status: 400 } })
        })

        it("rejects an unknown extra field", async () => {
          await expect(
            setInventory(owner, {
              variant_id: owner.variantId,
              location_id: owner.locationId,
              quantity: 1,
              vendor_id: "someone-else",
            }),
          ).rejects.toMatchObject({ response: { status: 400 } })
        })

        it("rejects a variant that does not exist", async () => {
          await expect(
            setInventory(owner, {
              variant_id: "variant_nope",
              location_id: owner.locationId,
              quantity: 1,
            }),
          ).rejects.toMatchObject({ response: {} })
        })

        it("rejects a location that does not exist", async () => {
          await expect(
            setInventory(owner, {
              variant_id: owner.variantId,
              location_id: "sloc_nope",
              quantity: 1,
            }),
          ).rejects.toMatchObject({ response: {} })
        })
      })

      describe("cross-vendor attempts", () => {
        it("refuses to read another vendor's product inventory", async () => {
          await expect(
            api.get(`/vendors/products/${owner.productId}/inventory`, {
              headers: intruder.headers,
            }),
          ).rejects.toMatchObject({ response: {} })
        })

        it("refuses to stock another vendor's product", async () => {
          await expect(
            setInventory(
              intruder,
              {
                variant_id: owner.variantId,
                location_id: intruder.locationId,
                quantity: 99,
              },
              owner.productId,
            ),
          ).rejects.toMatchObject({ response: {} })
        })

        it("refuses to stock into another vendor's location", async () => {
          await expect(
            setInventory(intruder, {
              variant_id: intruder.variantId,
              location_id: owner.locationId,
              quantity: 99,
            }),
          ).rejects.toMatchObject({ response: {} })
        })

        it("refuses a variant belonging to another vendor's product", async () => {
          await expect(
            setInventory(intruder, {
              variant_id: owner.variantId,
              location_id: intruder.locationId,
              quantity: 99,
            }),
          ).rejects.toMatchObject({ response: {} })
        })

        it("leaves the owner's stock untouched after a failed intrusion", async () => {
          await setInventory(owner, {
            variant_id: owner.variantId,
            location_id: owner.locationId,
            quantity: 7,
          })

          await setInventory(
            intruder,
            {
              variant_id: owner.variantId,
              location_id: intruder.locationId,
              quantity: 999,
            },
            owner.productId,
          ).catch(() => undefined)

          const after = await api.get(
            `/vendors/products/${owner.productId}/inventory`,
            { headers: owner.headers },
          )
          const level = after.data.variants[0].levels.find(
            (candidate: { location_id: string }) =>
              candidate.location_id === owner.locationId,
          )
          expect(level.quantity).toBe(7)
        })
      })
    })
  },
})
