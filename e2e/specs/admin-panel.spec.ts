import { expect, test } from "@playwright/test"
import { adminUrl, loginAsAdmin } from "../lib/admin-login"
import { FIRST_AFFILIATE } from "../lib/affiliate-login"
import { loginAsVendor } from "../lib/vendor-login"

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

  const row = page.locator("tbody tr", { hasText: FIRST_AFFILIATE.handle })
  await expect(row).toHaveCount(1)
  await expect(row).toContainText(
    `${Math.round(FIRST_AFFILIATE.commissionRate * 100)}%`,
  )
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

test("staff can create a vendor and its first user, who can then log in", async ({
  page,
  browser,
}) => {
  const vendor = throwaway()

  await loginAsAdmin(page)
  await page.goto(adminUrl("/vendors"))

  await page.getByRole("button", { name: "Create" }).first().click()
  await page.locator("#create-vendor-name").fill(vendor.name)
  await page.locator("#create-vendor-commission-rate").fill("0.15")
  await page.getByRole("button", { name: "Create" }).last().click()

  const row = page.locator("tbody tr", { hasText: vendor.name })
  await expect(row).toHaveCount(1)
  await expect(row).toContainText("15%")

  await row.getByRole("button").last().click()
  await page.getByRole("menuitem", { name: "Manage users" }).click()
  await expect(
    page.getByRole("heading", { name: `${vendor.name} users` }),
  ).toBeVisible()

  await page.getByRole("button", { name: "Create" }).first().click()
  await page.locator("#create-vendor-user-email").fill(vendor.email)
  await page.locator("#create-vendor-user-name").fill(vendor.name)
  await page.getByRole("button", { name: "Create" }).last().click()

  const otpPanel = page
    .getByText("Generated one-time password")
    .locator("xpath=../..")
  await expect(otpPanel).toBeVisible()
  const password = (await otpPanel.locator("p").last().innerText()).trim()
  await page.getByRole("button", { name: "Close" }).click()

  await expect(page.locator("tbody tr", { hasText: vendor.email })).toHaveCount(
    1,
  )

  const vendorContext = await browser.newContext()
  await loginAsVendor(await vendorContext.newPage(), {
    email: vendor.email,
    password,
  })
  await vendorContext.close()
})
