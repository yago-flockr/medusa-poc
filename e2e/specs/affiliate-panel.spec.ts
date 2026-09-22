import { expect, test } from "@playwright/test"
import { QWE_CREATORS, loginAsAffiliate } from "../lib/affiliate-login"

test("an affiliate can log in and reach every panel section", async ({
  page,
}) => {
  await loginAsAffiliate(page, QWE_CREATORS)

  await expect(page.getByRole("link", { name: "Sales" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Products" })).toBeVisible()
})

test("an affiliate sees the products they promote", async ({ page }) => {
  await loginAsAffiliate(page, QWE_CREATORS)

  await page.goto("/affiliate/products")

  await expect(
    page.getByText(QWE_CREATORS.promotedProductTitle, { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible()
})

test("an affiliate can promote and then stop promoting a product", async ({
  page,
}) => {
  await loginAsAffiliate(page, QWE_CREATORS)
  await page.goto("/affiliate/products")

  await page.getByRole("combobox").click()
  const option = page.getByRole("option").first()
  const promotedTitle = (await option.textContent())?.trim() ?? ""
  await option.click()
  await page.getByRole("button", { name: "Promote", exact: true }).click()

  // Asserted per row rather than by count: the e2e database is seeded once and
  // shared, so any other promoted product would make a count assertion flaky.
  const promotedRow = page.locator("tbody tr", { hasText: promotedTitle })
  await expect(promotedRow).toHaveCount(1)

  await promotedRow.getByRole("button", { name: "Remove" }).click()

  await expect(promotedRow).toHaveCount(0)
})

test("the sales page names the affiliate's own code", async ({ page }) => {
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
