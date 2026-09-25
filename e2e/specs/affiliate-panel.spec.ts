import { expect, test } from "@playwright/test"
import { FIRST_AFFILIATE, loginAsAffiliate } from "../lib/affiliate-login"
import {
  addOpenProductToCart,
  checkoutCartAndPlaceOrder,
} from "../lib/store-purchase"

test("an affiliate can log in and reach every panel section", async ({
  page,
}) => {
  await loginAsAffiliate(page, FIRST_AFFILIATE)

  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Products" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Profile" })).toBeVisible()
})

test("an affiliate sees the products they promote", async ({ page }) => {
  await loginAsAffiliate(page, FIRST_AFFILIATE)

  await page.goto("/affiliate/products")

  const promotedCard = page.locator('[data-slot="item"]').filter({
    has: page.getByText(FIRST_AFFILIATE.promotedProductTitle, { exact: true }),
  })

  await expect(promotedCard).toHaveCount(1)
  await expect(
    promotedCard.getByRole("button", { name: "Copy share link" }),
  ).toBeVisible()
})

test("an affiliate can promote and then stop promoting a product", async ({
  page,
}) => {
  await loginAsAffiliate(page, FIRST_AFFILIATE)
  await page.goto("/affiliate/products")

  await page.getByRole("button", { name: "Promote", exact: true }).click()

  const pickable = page
    .getByRole("dialog")
    .locator('[data-slot="item"]')
    .filter({ has: page.getByRole("button", { name: "Promote", exact: true }) })
    .first()
  const title =
    (
      await pickable.locator('[data-slot="item-title"]').textContent()
    )?.trim() ?? ""
  await pickable.getByRole("button", { name: "Promote", exact: true }).click()

  const promotedCard = page
    .locator('[data-slot="item"]')
    .filter({ has: page.getByText(title, { exact: true }) })

  await expect(promotedCard).toHaveCount(1)

  await promotedCard.getByRole("button", { name: "Stop promoting" }).click()

  await expect(promotedCard).toHaveCount(0)
})

test("the dashboard names the affiliate's own code", async ({ page }) => {
  await loginAsAffiliate(page, FIRST_AFFILIATE)

  await page.goto("/affiliate")

  await expect(
    page.getByText(
      `Everything bought through your code "${FIRST_AFFILIATE.handle}"`,
    ),
  ).toBeVisible()
})

test("signing out returns the affiliate to the log in screen", async ({
  page,
}) => {
  await loginAsAffiliate(page, FIRST_AFFILIATE)

  await page.getByRole("button", { name: "Sign Out" }).click()

  await expect(page.getByText("Affiliate log in")).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem("affiliate_token")),
    )
    .toBe('{"state":{"token":null},"version":0}')
})

async function readDashboardOrders(page: import("@playwright/test").Page) {
  await page.goto("/affiliate")
  const value = page
    .locator('[data-slot="card-title"]', { hasText: /^Orders$/ })
    .locator('xpath=ancestor::*[@data-slot="card"][1]')
    .locator('[data-slot="card-content"] p')
  await expect(value).toBeVisible()

  return Number(await value.innerText())
}

test("an order placed through the affiliate's share link shows on their dashboard", async ({
  page,
  browser,
}) => {
  await loginAsAffiliate(page, FIRST_AFFILIATE)
  const ordersBefore = await readDashboardOrders(page)

  const shopperContext = await browser.newContext()
  const shopper = await shopperContext.newPage()
  await shopper.goto(
    `/gb/products/${FIRST_AFFILIATE.promotedProductHandle}?ref=${FIRST_AFFILIATE.handle}`,
  )
  await addOpenProductToCart(shopper)
  await checkoutCartAndPlaceOrder(shopper)
  await shopperContext.close()

  await expect
    .poll(() => readDashboardOrders(page), { timeout: 30_000 })
    .toBe(ordersBefore + 1)
})
