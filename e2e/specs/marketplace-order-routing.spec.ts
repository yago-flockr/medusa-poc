import { expect, test } from "@playwright/test"
import { ASD_APPAREL, ZXC_THREADS, loginAsVendor } from "../lib/vendor-login"
import { buyProductByHandle } from "../lib/store-purchase"

test("an order reaches the vendor that owns the product, and no other vendor", async ({
  page,
  browser,
}) => {
  const orderNumber = await buyProductByHandle(page, "asd-apparel-classic-tee")

  const owningVendorContext = await browser.newContext()
  const owningVendorPage = await owningVendorContext.newPage()
  await loginAsVendor(owningVendorPage, ASD_APPAREL)
  await owningVendorPage.goto("/vendor/orders")

  await expect(
    owningVendorPage.getByText(`Order #${orderNumber}`, { exact: true }),
  ).toBeVisible()
  await owningVendorContext.close()

  const otherVendorContext = await browser.newContext()
  const otherVendorPage = await otherVendorContext.newPage()
  await loginAsVendor(otherVendorPage, ZXC_THREADS)
  await otherVendorPage.goto("/vendor/orders")

  await expect(
    otherVendorPage.getByText(`Order #${orderNumber}`, { exact: true }),
  ).toHaveCount(0)
  await otherVendorContext.close()
})
