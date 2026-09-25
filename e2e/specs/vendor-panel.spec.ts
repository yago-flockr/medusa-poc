import { expect, test } from "@playwright/test"
import { addOpenProductToCart } from "../lib/store-purchase"
import {
  FIRST_VENDOR,
  SECOND_VENDOR,
  THIRD_VENDOR,
  loginAsVendor,
} from "../lib/vendor-login"

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

test("a vendor can stock a new location with a size and color product that shoppers can buy", async ({
  page,
}) => {
  const suffix = Date.now().toString(36)
  const locationName = `Zz Warehouse ${suffix}`
  const title = `Zz Tee ${suffix}`
  const handle = `zz-tee-${suffix}`

  await loginAsVendor(page, THIRD_VENDOR)

  await page.goto("/vendor/locations")
  await page.getByRole("button", { name: "Create", exact: true }).click()
  const locationDialog = page.getByRole("dialog")
  await locationDialog.locator("#location-name").fill(locationName)
  await locationDialog.locator("#location-address-1").fill("1 Test Street")
  await locationDialog.locator("#location-city").fill("London")
  await locationDialog.locator("#location-province").fill("Greater London")
  await locationDialog.locator("#location-postal-code").fill("E1 6AN")
  await locationDialog.locator("#location-country").click()
  await page.getByRole("option").first().click()
  await locationDialog.getByRole("button", { name: "Save" }).click()
  await expect(page.getByText(locationName, { exact: true })).toBeVisible()

  await page.goto("/vendor/products")
  await page.getByRole("button", { name: "Create", exact: true }).click()
  const productDialog = page.getByRole("dialog")
  await productDialog.locator("#product-title").fill(title)
  await productDialog.locator("#product-handle").fill(handle)
  for (const [index, [name, values]] of [
    ["Size", "S, M"],
    ["Color", "Black, White"],
  ].entries()) {
    await productDialog.getByRole("button", { name: "Add option" }).click()
    await productDialog.locator(`#option-title-${index}`).fill(name)
    await productDialog.locator(`#option-values-${index}`).fill(values)
    await productDialog.locator(`#option-values-${index}`).blur()
  }
  const prices = productDialog.getByLabel("Price")
  await expect(prices).toHaveCount(4)
  for (const price of await prices.all()) {
    await price.fill("25")
  }
  for (const [index, sku] of (
    await productDialog.getByLabel("SKU").all()
  ).entries()) {
    await sku.fill(`${handle}-${index}`.toUpperCase())
  }
  await productDialog.getByRole("button", { name: "Save" }).click()

  const productRow = page
    .locator('[data-slot="item"]')
    .filter({ has: page.getByText(title, { exact: true }) })
  await expect(productRow).toContainText("4 variants")

  await productRow.getByRole("button", { name: "Edit product" }).click()
  await page.getByRole("dialog").locator("#product-edit-status").click()
  await page.getByRole("option", { name: "published" }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Save" }).click()
  await expect(productRow).toContainText("published")

  await productRow.getByRole("button", { name: "Manage inventory" }).click()
  const stock = page.getByRole("dialog").getByLabel(locationName)
  await expect(stock).toHaveCount(4)
  for (const quantity of await stock.all()) {
    await quantity.fill("10")
  }
  await page.getByRole("dialog").getByRole("button", { name: "Save" }).click()
  await expect(page.getByText("Inventory updated")).toBeVisible()

  await page.goto(`/gb/products/${handle}`)
  await addOpenProductToCart(page)
})
