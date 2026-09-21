import { expect, type Page } from "@playwright/test"

export const BUYER = {
  firstName: "E2E",
  lastName: "Buyer",
  address: "1 Test Street",
  postalCode: "SW1A 1AA",
  city: "London",
  province: "Greater London",
  email: "e2e-buyer@example.com",
  phone: "07700900000",
}

async function selectEveryProductOption(page: Page) {
  const optionGroups = page.getByTestId("product-options")
  const groupCount = await optionGroups.count()

  for (let index = 0; index < groupCount; index++) {
    await optionGroups.nth(index).getByTestId("option-button").first().click()
  }
}

async function fillShippingAddress(page: Page) {
  await page.getByTestId("shipping-first-name-input").fill(BUYER.firstName)
  await page.getByTestId("shipping-last-name-input").fill(BUYER.lastName)
  await page.getByTestId("shipping-address-input").fill(BUYER.address)
  await page.getByTestId("shipping-postal-code-input").fill(BUYER.postalCode)
  await page.getByTestId("shipping-city-input").fill(BUYER.city)
  await page.getByTestId("shipping-province-input").fill(BUYER.province)
  await page.getByTestId("shipping-email-input").fill(BUYER.email)
  await page.getByTestId("shipping-phone-input").fill(BUYER.phone)
}

export async function addOpenProductToCart(page: Page) {
  await expect(page.getByTestId("product-container")).toBeVisible()
  await selectEveryProductOption(page)

  const addToCart = page.getByTestId("add-product-button")
  await expect(addToCart).toBeEnabled()
  await addToCart.click()

  await expect(page.getByTestId("nav-cart-link")).toContainText("1")
}

export async function checkoutCartAndPlaceOrder(page: Page) {
  await page.goto("/gb/cart")
  await expect(page.getByTestId("product-row").first()).toBeVisible()
  await page.getByTestId("checkout-button").first().click()

  await expect(page).toHaveURL(/\/gb\/checkout/)

  await fillShippingAddress(page)
  await page.getByTestId("submit-address-button").click()

  // Each checkout step is compiled on first hit by the dev server, so the
  // wait here is for a cold build, not just a round trip.
  await expect(page.getByTestId("delivery-options-container")).toBeVisible({
    timeout: 60_000,
  })
  await page.getByTestId("delivery-option-radio").first().click()
  await page.getByTestId("submit-delivery-option-button").click()

  await page
    .getByRole("radio", { name: /Manual Payment/ })
    .click({ timeout: 30_000 })

  const continueToReview = page.getByTestId("submit-payment-button")
  await expect(continueToReview).toBeEnabled({ timeout: 30_000 })
  await continueToReview.click()

  const placeOrder = page.getByTestId("submit-order-button")
  await expect(placeOrder).toBeEnabled({ timeout: 30_000 })
  await placeOrder.click()

  await expect(page.getByTestId("order-complete-container")).toBeVisible({
    timeout: 30_000,
  })
  await expect(page).toHaveURL(/\/order\/.+\/confirmed/)

  const displayId = await page.getByTestId("order-id").innerText()
  return displayId.trim()
}

export async function buyProductByHandle(page: Page, productHandle: string) {
  await page.goto(`/gb/products/${productHandle}`)
  await addOpenProductToCart(page)
  return checkoutCartAndPlaceOrder(page)
}
