import { expect, test } from "@playwright/test"
import { adminUrl, loginAsAdmin } from "../lib/admin-login"
import { QWE_CREATORS } from "../lib/affiliate-login"

// Every test that mutates uses its own throwaway record: the e2e database is
// seeded once and shared, and resetting a seeded login would break the panel
// specs that sign in with the fixed fixture password.
const throwaway = () => {
  const suffix = Date.now().toString(36)
  return { name: `Zz Throwaway ${suffix}`, email: `zz-${suffix}@test.com` }
}

const openAffiliates = async (page: import("@playwright/test").Page) => {
  await page.goto(adminUrl("/affiliates"))
  await expect(
    page.getByText("Affiliates", { exact: true }).first(),
  ).toBeVisible()
}

test("staff can open the affiliates page and see a seeded affiliate", async ({
  page,
}) => {
  await loginAsAdmin(page)
  await openAffiliates(page)

  const row = page.locator("tbody tr", { hasText: QWE_CREATORS.handle })
  await expect(row).toHaveCount(1)
  await expect(row).toContainText("10%")
  await expect(row).toContainText("Active")
})

test("staff can create an affiliate, see its one-time password, then delete it", async ({
  page,
}) => {
  const affiliate = throwaway()

  await loginAsAdmin(page)
  await openAffiliates(page)

  await page.getByRole("button", { name: "Create" }).first().click()
  await page.locator("#create-affiliate-name").fill(affiliate.name)
  await page.locator("#create-affiliate-email").fill(affiliate.email)
  await page.locator("#create-affiliate-commission-rate").fill("0.2")
  await page.getByRole("button", { name: "Create" }).last().click()

  await expect(
    page.getByText("Copy it now, it won't be shown again", { exact: false }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Close" }).click()

  const row = page.locator("tbody tr", { hasText: affiliate.name })
  await expect(row).toHaveCount(1)
  await expect(row).toContainText("20%")

  await row.getByRole("button").last().click()
  await page.getByRole("menuitem", { name: "Delete" }).click()
  await page.getByRole("button", { name: "Delete", exact: true }).click()

  await expect(row).toHaveCount(0)
})

test("staff can regenerate an affiliate's password", async ({ page }) => {
  const affiliate = throwaway()

  await loginAsAdmin(page)
  await openAffiliates(page)

  await page.getByRole("button", { name: "Create" }).first().click()
  await page.locator("#create-affiliate-name").fill(affiliate.name)
  await page.locator("#create-affiliate-email").fill(affiliate.email)
  await page.locator("#create-affiliate-commission-rate").fill("0.1")
  await page.getByRole("button", { name: "Create" }).last().click()
  await page.getByRole("button", { name: "Close" }).click()

  const row = page.locator("tbody tr", { hasText: affiliate.name })
  await row.getByRole("button").last().click()
  await page.getByRole("menuitem", { name: "Regenerate Password" }).click()
  await page.getByRole("button", { name: "Regenerate", exact: true }).click()

  await expect(page.getByRole("button", { name: "Close" })).toBeVisible()
  await page.getByRole("button", { name: "Close" }).click()

  await row.getByRole("button").last().click()
  await page.getByRole("menuitem", { name: "Delete" }).click()
  await page.getByRole("button", { name: "Delete", exact: true }).click()
  await expect(row).toHaveCount(0)
})

test("staff reach a vendor's own users from the vendors page", async ({
  page,
}) => {
  await loginAsAdmin(page)

  await page.goto(adminUrl("/vendors"))
  const row = page.locator("tbody tr").first()
  await expect(row).toBeVisible()
  const vendorName = (await row.locator("td").nth(1).innerText()).trim()

  await row.getByRole("button").last().click()
  await page.getByRole("menuitem", { name: "Manage users" }).click()

  await expect(
    page.getByRole("heading", { name: `${vendorName} users` }),
  ).toBeVisible()
  await expect(page.locator("tbody tr").first()).toBeVisible()
})
