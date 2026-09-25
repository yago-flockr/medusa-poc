import { expect, test } from "@playwright/test"
import { FIRST_VENDOR, SECOND_VENDOR, loginAsVendor } from "../lib/vendor-login"

test("a vendor can log in and reach every panel section", async ({ page }) => {
  await loginAsVendor(page, FIRST_VENDOR)

  await expect(page.getByRole("link", { name: "Products" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Orders" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Locations" })).toBeVisible()
})

test("a vendor sees only their own products", async ({ page }) => {
  await loginAsVendor(page, FIRST_VENDOR)

  await page.goto("/vendor/products")

  await expect(
    page.getByText(FIRST_VENDOR.ownProductTitle, { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText(SECOND_VENDOR.ownProductTitle, { exact: true }),
  ).toHaveCount(0)
})

test("a vendor can open their orders page", async ({ page }) => {
  await loginAsVendor(page, FIRST_VENDOR)

  await page.goto("/vendor/orders")

  await expect(page).toHaveURL(/\/vendor\/orders/)
  await expect(page.getByText("Manage your orders")).toBeVisible()
})
