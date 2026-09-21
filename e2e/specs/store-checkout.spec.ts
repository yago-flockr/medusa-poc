import { expect, test } from "@playwright/test"
import {
  addOpenProductToCart,
  checkoutCartAndPlaceOrder,
} from "../lib/store-purchase"

test("a customer can buy a listed product from the store listing to a confirmed order", async ({
  page,
}) => {
  await page.goto("/gb/store")
  await page.locator('a[href^="/gb/products/"]').first().click()

  await addOpenProductToCart(page)

  const orderNumber = await checkoutCartAndPlaceOrder(page)

  expect(orderNumber).toMatch(/^\d+$/)
})
