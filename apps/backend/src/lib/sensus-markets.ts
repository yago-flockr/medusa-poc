/**
 * Sensus launch markets (RFP: UK · EU · US).
 * Single source for seed and docs. UK is default for Launch / v1.
 *
 * ISO 2 codes are lowercase (Medusa convention).
 */

export type SensusMarketId = "uk" | "eu" | "us"

export type SensusMarket = {
  id: SensusMarketId
  /** Medusa region name */
  regionName: string
  currencyCode: "gbp" | "eur" | "usd"
  /** ISO 3166-1 alpha-2, lowercase */
  countries: string[]
  /** Launch priority: uk first */
  isLaunchDefault: boolean
}

/** Core EU set for early localization (not full EU-27). Expand in v2 if needed. */
export const EU_COUNTRY_CODES = [
  "at", // Austria
  "be", // Belgium
  "de", // Germany
  "dk", // Denmark
  "es", // Spain
  "fr", // France
  "ie", // Ireland
  "it", // Italy
  "nl", // Netherlands
  "pt", // Portugal
  "se", // Sweden
] as const

export const SENSUS_MARKETS: SensusMarket[] = [
  {
    id: "uk",
    regionName: "United Kingdom",
    currencyCode: "gbp",
    countries: ["gb"],
    isLaunchDefault: true,
  },
  {
    id: "eu",
    regionName: "European Union",
    currencyCode: "eur",
    countries: [...EU_COUNTRY_CODES],
    isLaunchDefault: false,
  },
  {
    id: "us",
    regionName: "United States",
    currencyCode: "usd",
    countries: ["us"],
    isLaunchDefault: false,
  },
]

export const ALL_SENSUS_COUNTRY_CODES: string[] = SENSUS_MARKETS.flatMap(
  (m) => m.countries
)

export const DEFAULT_COUNTRY_CODE =
  SENSUS_MARKETS.find((m) => m.isLaunchDefault)?.countries[0] ?? "gb"

export const STORE_SUPPORTED_CURRENCIES = [
  { currency_code: "gbp" as const, is_default: true },
  { currency_code: "eur" as const, is_default: false },
  { currency_code: "usd" as const, is_default: false },
]

/** Flat geo zones for fulfillment seeding */
export function countryGeoZones(countryCodes: string[]) {
  return countryCodes.map((country_code) => ({
    country_code,
    type: "country" as const,
  }))
}
