import { expect, test } from "@playwright/test"
import { ASD_APPAREL, ZXC_THREADS, loginAsVendor } from "../lib/vendor-login"

test("a vendor can log in and reach every panel section", async ({ page }) => {
  await loginAsVendor(page, ASD_APPAREL)

  await expect(page.getByRole("link", { name: "Products" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Orders" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Locations" })).toBeVisible()
})

test("a vendor sees only their own products", async ({ page }) => {
  await loginAsVendor(page, ASD_APPAREL)

  await page.goto("/vendor/products")

  await expect(
    page.getByText(ASD_APPAREL.ownProductTitle, { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText(ZXC_THREADS.ownProductTitle, { exact: true }),
  ).toHaveCount(0)
})

test("a vendor can open their orders page", async ({ page }) => {
  await loginAsVendor(page, ASD_APPAREL)

  await page.goto("/vendor/orders")

  await expect(page).toHaveURL(/\/vendor\/orders/)
  await expect(page.getByText("Manage your orders")).toBeVisible()
})
