import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { resolve } from "path"

/**
 * Writes the seeded publishable API key into the storefront .env.local.
 * Safe to re-run. Does not print the key.
 */
export default async function syncPublishableKey({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const apiKeyModule = container.resolve(Modules.API_KEY)

  const [keys] = await apiKeyModule.listAndCountApiKeys({
    type: "publishable",
  })

  const key = keys[0]
  if (!key?.token) {
    throw new Error("No publishable API key found. Run migrations/seed first.")
  }

  const envPath = resolve(process.cwd(), "../storefront/.env.local")
  if (!existsSync(envPath)) {
    throw new Error(`Storefront env file not found at ${envPath}`)
  }

  const current = readFileSync(envPath, "utf8")
  const next = current.includes("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=")
    ? current.replace(
        /^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*$/m,
        `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${key.token}`
      )
    : `${current.trimEnd()}\nNEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${key.token}\n`

  writeFileSync(envPath, next)
  logger.info(
    `Synced publishable API key to storefront .env.local (token length ${key.token.length}).`
  )
}
