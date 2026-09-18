import { beforeAll, describe, expect, it, jest } from "@jest/globals"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { AFFILIATE_MODULE } from "../../src/modules/affiliate"
import AffiliateModuleService from "../../src/modules/affiliate/service"
import { createAdminUserWorkflow } from "../../src/workflows/create-admin-user"

jest.setTimeout(60000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("/admin/affiliates", () => {
      let adminHeaders: { Authorization: string }

      const postAffiliate = (body: Record<string, unknown>) =>
        api.post("/admin/affiliates", body, { headers: adminHeaders })

      const getAffiliates = (query = "") =>
        api.get(`/admin/affiliates${query}`, { headers: adminHeaders })

      const seedAffiliate = async (overrides: Record<string, unknown> = {}) => {
        const response = await postAffiliate({
          name: "Maria Silva",
          email: "maria@example.com",
          commission_rate: 0.1,
          ...overrides,
        })
        return response.data.affiliate
      }

      beforeAll(async () => {
        await createAdminUserWorkflow(getContainer()).run({
          input: {
            email: "affiliates-admin@test.com",
            password: "test1234",
            first_name: "Affiliates",
          },
        })

        const login = await api.post("/auth/user/emailpass", {
          email: "affiliates-admin@test.com",
          password: "test1234",
        })
        adminHeaders = { Authorization: `Bearer ${login.data.token}` }
      })

      it("rejects unauthenticated requests on every method", async () => {
        await expect(api.get("/admin/affiliates")).rejects.toMatchObject({
          response: { status: 401 },
        })
        await expect(
          api.post("/admin/affiliates", { name: "X" }),
        ).rejects.toMatchObject({ response: { status: 401 } })
        await expect(
          api.delete("/admin/affiliates/whatever"),
        ).rejects.toMatchObject({ response: { status: 401 } })
      })

      it("derives the handle from the name and normalizes the email", async () => {
        const affiliate = await seedAffiliate({ email: "  Maria@Example.COM " })

        expect(affiliate).toMatchObject({
          name: "Maria Silva",
          handle: "maria-silva",
          email: "maria@example.com",
          commission_rate: 0.1,
          is_active: true,
        })
      })

      it("refuses a second affiliate with the same handle", async () => {
        await seedAffiliate()

        await expect(
          seedAffiliate({ email: "someone-else@example.com" }),
        ).rejects.toMatchObject({ response: { status: 400 } })
      })

      it("refuses a commission rate outside the 0..1 fraction", async () => {
        await expect(
          seedAffiliate({ commission_rate: 1.5 }),
        ).rejects.toMatchObject({ response: { status: 400 } })
        await expect(
          seedAffiliate({ commission_rate: -0.1 }),
        ).rejects.toMatchObject({ response: { status: 400 } })
      })

      it("refuses an invalid email and a field the caller does not own", async () => {
        await expect(seedAffiliate({ email: "nope" })).rejects.toMatchObject({
          response: { status: 400 },
        })
        await expect(seedAffiliate({ is_active: false })).rejects.toMatchObject(
          { response: { status: 400 } },
        )
      })

      it("refuses a handle longer than the shared contract allows", async () => {
        await expect(
          seedAffiliate({ handle: "a".repeat(65) }),
        ).rejects.toMatchObject({ response: { status: 400 } })
      })

      it("filters by handle, filters by is_active, and paginates", async () => {
        await seedAffiliate()
        await seedAffiliate({
          name: "Joao Pereira",
          email: "joao@example.com",
          commission_rate: 0.15,
        })

        const byHandle = await getAffiliates("?handle=joao-pereira")
        expect(byHandle.data.affiliates).toHaveLength(1)
        expect(byHandle.data.affiliates[0].handle).toBe("joao-pereira")

        const inactive = await getAffiliates("?is_active=false")
        expect(inactive.data.affiliates).toHaveLength(0)

        const firstPage = await getAffiliates("?limit=1&offset=0")
        expect(firstPage.data.affiliates).toHaveLength(1)
        expect(firstPage.data.count).toBe(2)
      })

      it("rejects a non-boolean is_active filter", async () => {
        await expect(getAffiliates("?is_active=maybe")).rejects.toMatchObject({
          response: { status: 400 },
        })
      })

      it("retrieves one by id and 404s on an unknown id", async () => {
        const affiliate = await seedAffiliate()

        const response = await api.get(`/admin/affiliates/${affiliate.id}`, {
          headers: adminHeaders,
        })
        expect(response.data.affiliate.handle).toBe("maria-silva")

        await expect(
          api.get("/admin/affiliates/aff_does_not_exist", {
            headers: adminHeaders,
          }),
        ).rejects.toMatchObject({ response: { status: 404 } })
      })

      it("updates the commission rate and deactivates", async () => {
        const affiliate = await seedAffiliate()

        const response = await api.post(
          `/admin/affiliates/${affiliate.id}`,
          { commission_rate: 0.2, is_active: false },
          { headers: adminHeaders },
        )

        expect(response.data.affiliate).toMatchObject({
          commission_rate: 0.2,
          is_active: false,
        })
      })

      it("deletes an affiliate that has referred nothing", async () => {
        const affiliate = await seedAffiliate()

        const response = await api.delete(`/admin/affiliates/${affiliate.id}`, {
          headers: adminHeaders,
        })
        expect(response.data).toEqual({
          id: affiliate.id,
          object: "affiliate",
          deleted: true,
        })

        await expect(
          api.get(`/admin/affiliates/${affiliate.id}`, {
            headers: adminHeaders,
          }),
        ).rejects.toMatchObject({ response: { status: 404 } })
      })

      it("refuses to delete an affiliate that an order is attributed to", async () => {
        const affiliate = await seedAffiliate()

        const affiliateModuleService: AffiliateModuleService =
          getContainer().resolve(AFFILIATE_MODULE)

        await affiliateModuleService.createReferrals({
          affiliate_handle: affiliate.handle,
          commission_rate: affiliate.commission_rate,
          affiliate_id: affiliate.id,
        })

        await expect(
          api.delete(`/admin/affiliates/${affiliate.id}`, {
            headers: adminHeaders,
          }),
        ).rejects.toMatchObject({ response: { status: 400 } })

        const stillThere = await api.get(`/admin/affiliates/${affiliate.id}`, {
          headers: adminHeaders,
        })
        expect(stillThere.data.affiliate.handle).toBe(affiliate.handle)
      })
    })
  },
})
