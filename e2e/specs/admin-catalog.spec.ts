import { expect, type Page, test } from "@playwright/test"
import { adminUrl, loginAsAdmin } from "../lib/admin-login"
import { SEED_PLAN } from "../lib/seed-plan"

const product = SEED_PLAN.vendors[3].products[0]

async function addProductFromPicker(page: Page, detailUrl: string) {
  await page.goto(`${detailUrl}/products`)
  await page.getByRole("searchbox", { name: "Search" }).fill(product.title)
  const row = page.getByRole("row", { name: new RegExp(product.title) })
  await expect(row).toHaveCount(1)
  await row.getByRole("checkbox").check()
  await page.getByRole("button", { name: "Save", exact: true }).click()
  await expect(page).toHaveURL(detailUrl)
}

async function editStorefrontContent(
  page: Page,
  content: { name: string; description: string },
) {
  await page
    .getByRole("heading", { name: "Storefront Content" })
    .locator("xpath=ancestor::div[.//button][1]")
    .getByRole("button")
    .click()
  await page.getByRole("menuitem", { name: "Edit" }).click()
  await page.locator("#storefront-content-form-name").fill(content.name)
  await page
    .locator("#storefront-content-form-description")
    .fill(content.description)
  await page.getByRole("button", { name: "Save", exact: true }).click()
  await expect(page.getByText(content.description)).toBeVisible()
}

test("staff can build a category that shows its storefront content and products", async ({
  page,
}) => {
  const suffix = Date.now().toString(36)
  const handle = `zz-category-${suffix}`
  const content = {
    name: `Zz Category ${suffix}`,
    description: `Everything in the ${suffix} category.`,
  }

  await loginAsAdmin(page)
  await page.goto(adminUrl("/categories/create"))
  await page.getByRole("textbox", { name: "Title" }).fill(`Zz Admin ${suffix}`)
  await page.getByRole("textbox", { name: "Handle" }).fill(handle)
  await page.getByRole("button", { name: "Continue" }).click()
  await page.getByRole("button", { name: "Save", exact: true }).click()
  await page.waitForURL(/\/app\/categories\/pcat_/)
  const detailUrl = page.url()

  await addProductFromPicker(page, detailUrl)
  await editStorefrontContent(page, content)

  await page.goto(`/gb/categories/${handle}`)
  await expect(page.getByTestId("category-page-title")).toHaveText(content.name)
  await expect(
    page.getByTestId("product-title").filter({ hasText: product.title }),
  ).toBeVisible()
})

test("staff can build a collection that shows its storefront content and products", async ({
  page,
}) => {
  const suffix = Date.now().toString(36)
  const handle = `zz-collection-${suffix}`
  const content = {
    name: `Zz Collection ${suffix}`,
    description: `Everything in the ${suffix} collection.`,
  }

  await loginAsAdmin(page)
  await page.goto(adminUrl("/collections"))
  await page.getByRole("link", { name: "Create" }).click()
  // Medusa's admin mounts this create modal twice; Ctrl+Enter is its keybound submit.
  const form = page.locator("form", { hasText: "Create Collection" }).last()
  await form.locator('input[name="title"]').fill(`Zz Admin ${suffix}`)
  await form.locator('input[name="handle"]').fill(handle)
  await form.locator('input[name="handle"]').press("Control+Enter")
  await page.waitForURL(/\/app\/collections\/pcol_/)
  const detailUrl = page.url()

  await addProductFromPicker(page, detailUrl)
  await editStorefrontContent(page, content)

  await page.goto(`/gb/collections/${handle}`)
  await expect(page.getByTestId("collection-page-title")).toHaveText(
    content.name,
  )
  await expect(
    page.getByTestId("product-title").filter({ hasText: product.title }),
  ).toBeVisible()
})
