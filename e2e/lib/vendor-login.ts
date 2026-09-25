import { expect, type Page } from "@playwright/test"
import { SEED_PLAN } from "./seed-plan"

export type VendorFixture = {
  email: string
  password: string
  ownProductTitle: string
  ownProductHandle: string
}

function toVendorFixture(
  vendor: (typeof SEED_PLAN.vendors)[number],
): VendorFixture {
  return {
    email: vendor.email,
    password: vendor.password,
    ownProductTitle: vendor.products[0].title,
    ownProductHandle: vendor.products[0].handle,
  }
}

export const FIRST_VENDOR = toVendorFixture(SEED_PLAN.vendors[0])
export const SECOND_VENDOR = toVendorFixture(SEED_PLAN.vendors[1])
export const THIRD_VENDOR = toVendorFixture(SEED_PLAN.vendors[2])

export async function loginAsVendor(
  page: Page,
  vendor: Pick<VendorFixture, "email" | "password">,
) {
  await page.goto("/vendor")

  await page.getByLabel("Email").fill(vendor.email)
  await page.getByLabel("Password").fill(vendor.password)
  await page.getByRole("button", { name: "Log in" }).click()

  await expect(page.getByRole("link", { name: "Products" })).toBeVisible()

  // The gate renders nothing until mounted, so only the persisted token
  // proves a later hard navigation will still be logged in.
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem("vendor_token")),
    )
    .not.toBeNull()
}
