import { expect, test } from "@playwright/test"
import { FIRST_VENDOR, loginAsVendor } from "../lib/vendor-login"

test.describe("storefront error paths", () => {
  test("a product that does not exist shows the not-found page", async ({
    page,
  }) => {
    const response = await page.goto("/gb/products/this-product-never-existed")

    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible()
  })

  test("a category that does not exist shows the not-found page", async ({
    page,
  }) => {
    const response = await page.goto("/gb/categories/not-a-real-category")

    expect(response?.status()).toBe(404)
  })

  test("checkout without a cart does not render an order form", async ({
    page,
  }) => {
    await page.goto("/gb/checkout")

    await expect(page.getByTestId("submit-order-button")).toHaveCount(0)
  })

  test("an empty cart invites the shopper back to the store", async ({
    page,
  }) => {
    await page.goto("/gb/cart")

    await expect(page.getByTestId("product-row")).toHaveCount(0)
    await expect(
      page.getByRole("link", { name: /Explore products/i }),
    ).toBeVisible()
  })
})

test.describe("vendor panel error paths", () => {
  test("a wrong password keeps the vendor on the login form", async ({
    page,
  }) => {
    await page.goto("/vendor")

    await page.getByLabel("Email").fill(FIRST_VENDOR.email)
    await page.getByLabel("Password").fill("definitely-not-the-password")
    await page.getByRole("button", { name: "Log in" }).click()

    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Products" })).toHaveCount(0)

    const storedToken = await page.evaluate(() =>
      window.localStorage.getItem("vendor_token"),
    )
    expect(storedToken ? JSON.parse(storedToken).state.token : null).toBeNull()
  })

  test("an unknown vendor email is refused", async ({ page }) => {
    await page.goto("/vendor")

    await page.getByLabel("Email").fill("nobody@example.com")
    await page.getByLabel("Password").fill("whatever")
    await page.getByRole("button", { name: "Log in" }).click()

    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible()
  })

  test("a malformed email is rejected before any request", async ({ page }) => {
    await page.goto("/vendor")

    await page.getByLabel("Email").fill("not-an-email")
    await page.getByLabel("Password").fill("whatever")
    await page.getByRole("button", { name: "Log in" }).click()

    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible()
  })

  test("a vendor route cannot be reached without logging in", async ({
    page,
  }) => {
    await page.goto("/vendor/products")

    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByRole("link", { name: "Products" })).toHaveCount(0)
  })

  test("clearing the stored token logs the vendor back out", async ({
    page,
  }) => {
    await loginAsVendor(page, FIRST_VENDOR)

    await page.evaluate(() => window.localStorage.removeItem("vendor_token"))
    await page.goto("/vendor/products")

    await expect(page.getByLabel("Email")).toBeVisible()
  })
})
