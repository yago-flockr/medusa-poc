import { expect, type Page } from "@playwright/test"
import { BACKEND_URL } from "./e2e-config"

export const ADMIN = {
  email: "admin@staff.com",
  password: "123",
}

export const adminUrl = (path: string) => `${BACKEND_URL}/app${path}`

export async function loginAsAdmin(page: Page) {
  await page.goto(adminUrl("/login"))

  await page.locator('input[name="email"]').fill(ADMIN.email)
  await page.locator('input[name="password"]').fill(ADMIN.password)
  await page.getByRole("button", { name: /continue|sign in|log in/i }).click()

  await expect(page).toHaveURL(/\/app(\/|$)/)
  await expect(page.locator('input[name="password"]')).toHaveCount(0)
}
