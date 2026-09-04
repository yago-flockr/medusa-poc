import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, ModuleRegistrationName, Modules } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  ALL_MARKET_COUNTRY_CODES,
  STORE_SUPPORTED_CURRENCIES,
  DEFAULT_MARKETS,
  countryGeoZones,
} from "../src/lib/markets"

export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT,
  )

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

  logger.info("Seeding region data (UK, US)...")
  const { result: regionResult } = await createRegionsWorkflow(container).run({
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

  logger.info("Seeding stock location data...")
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container,
  ).run({
    input: {
      locations: [
        {
          name: "Main Warehouse",
          address: {
            city: "London",
            country_code: "GB",
            address_1: "",
          },
        },
      ],
    },
  })
  const stockLocation = stockLocationResult[0]

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  })

  logger.info("Seeding fulfillment data...")
  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfile = shippingProfileResult[0]

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Default markets delivery",
    type: "shipping",
    service_zones: [
      {
        name: "UK · US",
        geo_zones: countryGeoZones(countries),
      },
    ],
  })

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  })

  const regionShippingPrices = regionResult.map((region) => ({
    region_id: region.id,
    amount: 10,
  }))

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          { currency_code: "gbp", amount: 10 },
          { currency_code: "usd", amount: 10 },
          ...regionShippingPrices,
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          { currency_code: "gbp", amount: 15 },
          { currency_code: "usd", amount: 15 },
          ...regionShippingPrices.map((p) => ({ ...p, amount: 15 })),
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  })
  logger.info("Finished seeding fulfillment data.")

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  })
  logger.info("Finished seeding stock location data.")
}
