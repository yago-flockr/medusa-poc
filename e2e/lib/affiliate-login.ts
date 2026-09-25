import { expect, type Page } from "@playwright/test"
import { SEED_PLAN } from "./seed-plan"

export type AffiliateFixture = {
  email: string
  password: string
  handle: string
  commissionRate: number
  promotedProductTitle: string
}

const [firstAffiliate] = SEED_PLAN.affiliates

export const FIRST_AFFILIATE: AffiliateFixture = {
  email: firstAffiliate.email,
  password: firstAffiliate.password,
  handle: firstAffiliate.handle,
  commissionRate: firstAffiliate.commissionRate,
  promotedProductTitle: SEED_PLAN.vendors
    .flatMap((vendor) => vendor.products)
    .find((product) => product.handle === firstAffiliate.productHandles[0])!
    .title,
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
