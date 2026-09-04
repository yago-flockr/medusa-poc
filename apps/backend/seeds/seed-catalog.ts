import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  ALL_MARKET_COUNTRY_CODES,
  STORE_SUPPORTED_CURRENCIES,
  DEFAULT_MARKETS,
} from "../src/lib/markets"

// Platform-level setup only: sales channel, publishable key, store
// currencies, regions, tax regions. Stock locations and their shipping
// belong to vendors — seeded, if at all, by seed-vendors.ts via the same
// createVendorStockLocationWorkflow the real vendor panel uses (which
// auto-provisions free shipping per location). This script never creates
// a stock location of its own.
export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const countries = ALL_MARKET_COUNTRY_CODES

  logger.info("Seeding store data...")

  // Medusa's core migration already creates one default store + sales
  // channel. Creating new ones here (instead of reusing/updating them)
  // leaves the migration-created store behind with only its default "eur"
  // currency — which is the one every other workflow resolves via
  // `query.graph({ entity: "store" })`, so product prices silently end up
  // EUR-only regardless of what currencies this seed intends to support.
  const { data: existingSalesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
  })

  const defaultSalesChannel = existingSalesChannels[0]
    ? existingSalesChannels[0]
    : (
        await createSalesChannelsWorkflow(container).run({
          input: {
            salesChannelsData: [
              {
                name: "Default Sales Channel",
                description: "Created by Medusa",
              },
            ],
          },
        })
      ).result[0]

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  })

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  })

  const { data: existingStores } = await query.graph({
    entity: "store",
    fields: ["id"],
  })

  if (existingStores[0]) {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: existingStores[0].id },
        update: {
          name: "Medusa Store",
          supported_currencies: [...STORE_SUPPORTED_CURRENCIES],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      },
    })
  } else {
    await createStoresWorkflow(container).run({
      input: {
        stores: [
          {
            name: "Medusa Store",
            supported_currencies: [...STORE_SUPPORTED_CURRENCIES],
            default_sales_channel_id: defaultSalesChannel.id,
          },
        ],
      },
    })
  }

  logger.info("Seeding region data (UK)...")
  await createRegionsWorkflow(container).run({
    input: {
      regions: DEFAULT_MARKETS.map((market) => ({
        name: market.regionName,
        currency_code: market.currencyCode,
        countries: market.countries,
        payment_providers: ["pp_system_default"],
      })),
    },
  })
  logger.info("Finished seeding regions.")

  logger.info("Seeding tax regions...")
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  })
  logger.info("Finished seeding tax regions.")
}
