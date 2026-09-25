import { expect, test } from "@playwright/test"
import type { Browser } from "@playwright/test"
import {
  FIRST_VENDOR,
  SECOND_VENDOR,
  THIRD_VENDOR,
  type VendorFixture,
  loginAsVendor,
} from "../lib/vendor-login"
import {
  addOpenProductToCart,
  buyProductByHandle,
  checkoutCartAndPlaceOrder,
} from "../lib/store-purchase"

test("an order reaches the vendor that owns the product, and no other vendor", async ({
  page,
  browser,
}) => {
  const orderNumber = await buyProductByHandle(
    page,
    FIRST_VENDOR.ownProductHandle,
  )

  const owningVendorContext = await browser.newContext()
  const owningVendorPage = await owningVendorContext.newPage()
  await loginAsVendor(owningVendorPage, FIRST_VENDOR)
  await owningVendorPage.goto("/vendor/orders")

  await expect(
    owningVendorPage.getByText(`Order #${orderNumber}`, { exact: true }),
  ).toBeVisible()
  await owningVendorContext.close()

  const otherVendorContext = await browser.newContext()
  const otherVendorPage = await otherVendorContext.newPage()
  await loginAsVendor(otherVendorPage, SECOND_VENDOR)
  await otherVendorPage.goto("/vendor/orders")

  await expect(
    otherVendorPage.getByText(`Order #${orderNumber}`, { exact: true }),
  ).toHaveCount(0)
  await otherVendorContext.close()
})

async function openVendorOrder(
  browser: Browser,
  vendor: VendorFixture,
  orderNumber: string,
) {
  const context = await browser.newContext()
  const page = await context.newPage()
  await loginAsVendor(page, vendor)
  await page.goto("/vendor/orders")

  return {
    context,
    page,
    order: page.getByText(`Order #${orderNumber}`, { exact: true }),
  }
}

test("an order across two vendors reaches each one with only their own items", async ({
  page,
  browser,
}) => {
  await page.goto(`/gb/products/${FIRST_VENDOR.ownProductHandle}`)
  await addOpenProductToCart(page, 1)
  await page.goto(`/gb/products/${SECOND_VENDOR.ownProductHandle}`)
  await addOpenProductToCart(page, 2)
  const orderNumber = await checkoutCartAndPlaceOrder(page)

  for (const [vendor, otherVendor] of [
    [FIRST_VENDOR, SECOND_VENDOR],
    [SECOND_VENDOR, FIRST_VENDOR],
  ]) {
    const {
      context,
      page: vendorPage,
      order,
    } = await openVendorOrder(browser, vendor, orderNumber)
    await expect(order).toBeVisible()

    await vendorPage
      .locator('[data-slot="item"]')
      .filter({ has: order })
      .getByRole("button", { name: "Manage order" })
      .click()
    const detail = vendorPage.getByRole("dialog")
    await expect(detail.getByText(vendor.ownProductTitle)).toBeVisible()
    await expect(detail.getByText(otherVendor.ownProductTitle)).toHaveCount(0)
    await context.close()
  }

  const { context, order } = await openVendorOrder(
    browser,
    THIRD_VENDOR,
    orderNumber,
  )
  await expect(order).toHaveCount(0)
  await context.close()
})
