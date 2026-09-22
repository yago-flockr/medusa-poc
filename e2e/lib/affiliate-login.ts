import { expect, type Page } from "@playwright/test"

export type AffiliateFixture = {
  email: string
  password: string
  handle: string
  promotedProductTitle: string
}

export const QWE_CREATORS: AffiliateFixture = {
  email: "qwe@qwe.com",
  password: "qwe",
  handle: "qwe-creators",
  promotedProductTitle: "Classic Tee",
}

export async function loginAsAffiliate(
  page: Page,
  affiliate: AffiliateFixture,
) {
  await page.goto("/affiliate")

  await page.getByLabel("Email").fill(affiliate.email)
  await page.getByLabel("Password").fill(affiliate.password)
  await page.getByRole("button", { name: "Log in" }).click()

  await expect(page.getByRole("link", { name: "Products" })).toBeVisible()

  // The gate renders nothing until mounted, so only the persisted token
  // proves a later hard navigation will still be logged in.
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem("affiliate_token")),
    )
    .not.toBeNull()
}
