import type { GetVendorsProductsByIdInventoryResponse } from "@dtc/api-contracts/vendor/product-inventory"

type RawLevel = {
  inventory_item_id: string
  location_id: string
  stocked_quantity: number | string
  reserved_quantity: number | string
}

type RawVariant = {
  id: string
  title: string
  inventory_items?: ({ inventory?: { id: string } | null } | null)[] | null
}

type RawLocation = { id: string; name: string }

export function buildVendorProductInventory(
  variants: RawVariant[],
  levels: RawLevel[],
  locations: RawLocation[],
): GetVendorsProductsByIdInventoryResponse {
  return {
    variants: variants.map((variant) => {
      const inventoryItemId =
        variant.inventory_items?.[0]?.inventory?.id ?? null

      return {
        variant_id: variant.id,
        variant_title: variant.title,
        levels: levels
          .filter((level) => level.inventory_item_id === inventoryItemId)
          .map((level) => ({
            location_id: level.location_id,
            quantity: Number(level.stocked_quantity),
            reserved_quantity: Number(level.reserved_quantity),
          })),
      }
    }),
    locations: locations.map((location) => ({
      id: location.id,
      name: location.name,
    })),
  }
}
