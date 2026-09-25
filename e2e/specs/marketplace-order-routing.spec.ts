import { expect, test } from "@playwright/test"
import { FIRST_VENDOR, SECOND_VENDOR, loginAsVendor } from "../lib/vendor-login"
import { buyProductByHandle } from "../lib/store-purchase"

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
