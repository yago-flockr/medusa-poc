import { expect, type Page } from "@playwright/test"

export type VendorFixture = {
  email: string
  password: string
  ownProductTitle: string
}

export const ASD_APPAREL: VendorFixture = {
  email: "asd@asd.com",
  password: "asd",
  ownProductTitle: "Classic Tee",
}

export const ZXC_THREADS: VendorFixture = {
  email: "zxc@zxc.com",
  password: "zxc",
  ownProductTitle: "Archive Logo Sweat",
}

export async function loginAsVendor(page: Page, vendor: VendorFixture) {
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
