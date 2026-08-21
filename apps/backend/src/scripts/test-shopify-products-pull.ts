import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { syncShopifyProductsWorkflow } from "../workflows/sync-shopify-products"
import type { ShopifyStoreCredentials } from "../lib/shopify-test-pull"

/**
 * Spike-only, dev-only trigger. Credentials aren't a shared app-level env
 * config — each vendor will have their own — so this script takes them
 * per-invocation: `medusa exec ./src/scripts/test-shopify-products-pull.ts
 * <store-domain> <client-id> <client-secret>`, so testing a second store
 * never means overwriting the first one's values in `.env`. Falls back to
 * SHOPIFY_STORE_DOMAIN/SHOPIFY_CLIENT_ID/SHOPIFY_CLIENT_SECRET only as a
 * local convenience when no args are given. docs/spikes/vendor-shopify-sync.md
 */
function resolveCredentials(args: string[]): ShopifyStoreCredentials {
  const [storeDomain, clientId, clientSecret] = args

  const resolved = {
    storeDomain: storeDomain ?? process.env.SHOPIFY_STORE_DOMAIN,
    clientId: clientId ?? process.env.SHOPIFY_CLIENT_ID,
    clientSecret: clientSecret ?? process.env.SHOPIFY_CLIENT_SECRET,
  }

  if (!resolved.storeDomain || !resolved.clientId || !resolved.clientSecret) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Missing Shopify credentials. Pass <store-domain> <client-id> <client-secret> as script args, or set SHOPIFY_STORE_DOMAIN/SHOPIFY_CLIENT_ID/SHOPIFY_CLIENT_SECRET locally. See docs/spikes/vendor-shopify-sync.md.",
    )
  }

  return resolved as ShopifyStoreCredentials
}

export default async function testShopifyProductsPull({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const credentials = resolveCredentials(args)

  const { result } = await syncShopifyProductsWorkflow(container).run({
    input: {
      credentials,
      first: Number(process.env.SHOPIFY_PULL_PAGE_SIZE ?? "5"),
    },
  })

  logger.info(
    `[${credentials.storeDomain}] Created ${result.created_count} product(s), skipped ${result.skipped_shopify_ids.length} already-imported`,
  )
  for (const product of result.created) {
    logger.info(`Created: ${product.title} (${product.id})`)
  }
}
