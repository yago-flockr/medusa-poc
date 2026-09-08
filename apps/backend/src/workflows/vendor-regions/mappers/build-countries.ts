import type { VendorCountry } from "@dtc/api-contracts/vendor/regions"

type RegionCountry = {
  iso_2: string | null | undefined
  display_name: string | null | undefined
} | null

export function buildCountries(
  regions: { countries: RegionCountry[] | null | undefined }[],
): VendorCountry[] {
  const seen = new Set<string>()

  return regions
    .flatMap((region) => region.countries ?? [])
    .filter(
      (country): country is NonNullable<RegionCountry> =>
        country != null && Boolean(country.iso_2),
    )
    .filter((country) => {
      if (seen.has(country.iso_2!)) return false
      seen.add(country.iso_2!)
      return true
    })
    .map((country) => ({
      iso_2: country.iso_2!,
      display_name: country.display_name ?? country.iso_2!.toUpperCase(),
    }))
    .sort((a, b) => a.display_name.localeCompare(b.display_name))
}
