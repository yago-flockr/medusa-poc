import { expect, test } from "@playwright/test"
import { QWE_CREATORS, loginAsAffiliate } from "../lib/affiliate-login"

test("an affiliate can log in and reach every panel section", async ({
  page,
}) => {
  await loginAsAffiliate(page, QWE_CREATORS)

  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Products" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Profile" })).toBeVisible()
})

test("an affiliate sees the products they promote", async ({ page }) => {
  await loginAsAffiliate(page, QWE_CREATORS)

  await page.goto("/affiliate/products")

  const promotedCard = page.locator('[data-slot="item"]').filter({
    has: page.getByText(QWE_CREATORS.promotedProductTitle, { exact: true }),
  })

  await expect(promotedCard).toHaveCount(1)
  await expect(
    promotedCard.getByRole("button", { name: "Copy share link" }),
  ).toBeVisible()
})

test("an affiliate can promote and then stop promoting a product", async ({
  page,
}) => {
  await loginAsAffiliate(page, QWE_CREATORS)
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
  await loginAsAffiliate(page, QWE_CREATORS)

  await page.goto("/affiliate")

  await expect(
    page.getByText(
      `Everything bought through your code "${QWE_CREATORS.handle}"`,
    ),
  ).toBeVisible()
})

test("signing out returns the affiliate to the log in screen", async ({
  page,
}) => {
  await loginAsAffiliate(page, QWE_CREATORS)

  await page.getByRole("button", { name: "Sign Out" }).click()

  await expect(page.getByText("Affiliate log in")).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem("affiliate_token")),
    )
    .toBe('{"state":{"token":null},"version":0}')
})
