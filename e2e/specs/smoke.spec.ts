import { expect, test } from "@playwright/test"

test("storefront home page lists products from the seeded catalogue", async ({
  page,
}) => {
  await page.goto("/gb")

  await expect(page).toHaveTitle(/Store/)
  await expect(page.locator('a[href^="/gb/products/"]').first()).toBeVisible()
})
