import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createVendorWorkflow } from "../../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../../src/workflows/vendor-users/create-vendor-user"

jest.setTimeout(120000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/vendors/products under load", () => {
      let vendorHeaders: { Authorization: string }

      const createProduct = (
        title: string,
        extra: Record<string, unknown> = {},
      ) =>
        api.post(
          "/vendors/products",
          {
            title,
            variants: [{ optionValues: {}, price: 1000 }],
            ...extra,
          },
          { headers: vendorHeaders },
        )

      const listProducts = (query = "") =>
        api.get(`/vendors/products${query}`, { headers: vendorHeaders })

      beforeAll(async () => {
        const container = getContainer()

        const { result: vendor } = await createVendorWorkflow(container).run({
          input: { name: "Load Vendor" },
        })

        await createVendorUserWorkflow(container).run({
          input: {
            vendor_id: vendor.id,
            email: "load-vendor@test.com",
            password: "test1234",
            first_name: "Load",
          },
        })

        const login = await api.post("/auth/vendor/emailpass", {
          email: "load-vendor@test.com",
          password: "test1234",
        })
        vendorHeaders = { Authorization: `Bearer ${login.data.token}` }
      })

      it("creates many products concurrently without losing any", async () => {
        const titles = Array.from(
          { length: 10 },
          (_, index) => `Concurrent Product ${index}`,
        )

        const results = await Promise.all(
          titles.map((title) => createProduct(title)),
        )

        expect(results.every((result) => result.status === 200)).toBe(true)

        const list = await listProducts("?limit=100")
        const created = list.data.products.filter(
          (product: { title: string }) =>
            product.title.startsWith("Concurrent Product "),
        )
        expect(created).toHaveLength(10)
      })

      it("lets only one of several racing creates take a handle", async () => {
        const attempts = await Promise.allSettled(
          Array.from({ length: 5 }, () =>
            createProduct("Racing Product", { handle: "racing-handle" }),
          ),
        )

        const succeeded = attempts.filter(
          (attempt) => attempt.status === "fulfilled",
        )
        expect(succeeded).toHaveLength(1)

        const list = await listProducts("?limit=100")
        const withHandle = list.data.products.filter(
          (product: { handle: string }) => product.handle === "racing-handle",
        )
        expect(withHandle).toHaveLength(1)
      })

      it("pages through a large catalogue without repeating or dropping a product", async () => {
        await Promise.all(
          Array.from({ length: 12 }, (_, index) =>
            createProduct(`Paged Product ${index}`),
          ),
        )

        const firstPage = await listProducts("?limit=5&offset=0")
        const secondPage = await listProducts("?limit=5&offset=5")
        const thirdPage = await listProducts("?limit=5&offset=10")

        expect(firstPage.data.products).toHaveLength(5)
        expect(secondPage.data.products).toHaveLength(5)
        expect(firstPage.data.count).toBeGreaterThanOrEqual(12)

        const seen = [
          ...firstPage.data.products,
          ...secondPage.data.products,
          ...thirdPage.data.products,
        ].map((product: { id: string }) => product.id)

        expect(new Set(seen).size).toBe(seen.length)
      })

      it("reports a stable total while paging", async () => {
        await Promise.all(
          Array.from({ length: 6 }, (_, index) =>
            createProduct(`Counted Product ${index}`),
          ),
        )

        const firstPage = await listProducts("?limit=2&offset=0")
        const lastPage = await listProducts("?limit=2&offset=4")

        expect(lastPage.data.count).toBe(firstPage.data.count)
      })

      it("returns an empty page past the end rather than erroring", async () => {
        await createProduct("Only Product")

        const response = await listProducts("?limit=10&offset=5000")

        expect(response.status).toBe(200)
        expect(response.data.products).toHaveLength(0)
      })

      it("survives repeated reads of the same list", async () => {
        await createProduct("Hammered Product")

        const responses = await Promise.all(
          Array.from({ length: 20 }, () => listProducts("?limit=50")),
        )

        expect(responses.every((response) => response.status === 200)).toBe(
          true,
        )
        const counts = responses.map((response) => response.data.count)
        expect(new Set(counts).size).toBe(1)
      })
    })
  },
})
