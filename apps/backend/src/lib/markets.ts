/**
 * Default seed markets for the chassis. POC scope: a single market
 * (UK · GBP) — this stays an array, and every consumer loops over it, so
 * adding a second market back later is a data change here, not a refactor.
 * ISO 2 codes are lowercase (Medusa convention).
 */

export type MarketId = "uk"

export type Market = {
  id: MarketId
  regionName: string
  currencyCode: "gbp"
  countries: string[]
  isLaunchDefault: boolean
}

export const DEFAULT_MARKETS: Market[] = [
  {
    id: "uk",
    regionName: "United Kingdom",
    currencyCode: "gbp",
    countries: ["gb"],
    isLaunchDefault: true,
  },
]

export const ALL_MARKET_COUNTRY_CODES: string[] = DEFAULT_MARKETS.flatMap(
  (m) => m.countries,
)

export const DEFAULT_COUNTRY_CODE =
  DEFAULT_MARKETS.find((m) => m.isLaunchDefault)?.countries[0] ?? "gb"

export const STORE_SUPPORTED_CURRENCIES = [
  { currency_code: "gbp" as const, is_default: true },
]

/** Flat geo zones for fulfillment seeding */
export function countryGeoZones(countryCodes: string[]) {
  return countryCodes.map((country_code) => ({
    country_code,
    type: "country" as const,
  }))
}
