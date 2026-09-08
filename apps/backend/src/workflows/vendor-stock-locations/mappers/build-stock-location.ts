import type { VendorStockLocation } from "@dtc/api-contracts/vendor/stock-locations"

type RawStockLocation = {
  id: string
  name: string
  address?: {
    address_1: string
    address_2?: string | null
    city?: string | null
    province?: string | null
    postal_code?: string | null
    country_code: string
    phone?: string | null
  } | null
}

export function buildStockLocation(
  location: RawStockLocation,
): VendorStockLocation {
  return {
    id: location.id,
    name: location.name,
    address: location.address
      ? {
          address_1: location.address.address_1,
          address_2: location.address.address_2 ?? null,
          city: location.address.city ?? null,
          province: location.address.province ?? null,
          postal_code: location.address.postal_code ?? null,
          country_code: location.address.country_code,
          phone: location.address.phone ?? null,
        }
      : null,
  }
}
