import type { VendorCartItem } from "../steps/resolve-vendor-cart-items"

type VendorRef = { id: string; name: string }

type GroupableOption = {
  name?: string | null
  amount?: number | null
  price_type?: string | null
  type?: { code?: string | null } | null
  shipping_profile_id?: string | null
  service_zone?: {
    fulfillment_set?: {
      location?: { id?: string | null } | null
    } | null
  } | null
}

// A vendor's shipping option selection is a pricing/service choice, not a
// warehouse pick — Medusa reserves each item from wherever it actually has
// stock at checkout, regardless of which option was selected. So options
// that look identical to the customer (same name/price/type) are grouped,
// and coverage is checked across the union of their locations, not one.
function groupKey(vendorId: string, option: GroupableOption): string {
  return [
    vendorId,
    option.name,
    option.amount,
    option.price_type,
    option.type?.code,
  ].join("::")
}

function isInsufficientAcrossLocations(
  items: VendorCartItem[],
  locationIds: Set<string>,
): boolean {
  return items.some((item) => {
    if (!item.variant?.manage_inventory || item.variant.allow_backorder) {
      return false
    }

    return (item.variant.inventory_items ?? []).some((inventoryItem) => {
      if (!inventoryItem?.inventory?.requires_shipping) {
        return false
      }

      const availableInGroup = (inventoryItem.inventory.location_levels ?? [])
        .filter(
          (level): level is NonNullable<typeof level> =>
            level !== null && locationIds.has(level.location_id),
        )
        .reduce((sum, level) => sum + level.available_quantity, 0)

      return availableInGroup < item.quantity
    })
  })
}

export function buildVendorShippingOptions<TOption extends GroupableOption>(
  shippingOptions: TOption[],
  vendorByProfileId: Record<string, VendorRef>,
  itemsByVendorId: Record<string, VendorCartItem[]>,
): (TOption & { vendor: VendorRef | null })[] {
  const withVendor = shippingOptions.map((option) => ({
    ...option,
    vendor: option.shipping_profile_id
      ? (vendorByProfileId[option.shipping_profile_id] ?? null)
      : null,
  }))

  // A profile that fails to resolve to a vendor means the vendor was
  // deleted — that's an orphaned option, not a genuine store-level one.
  const vendorless = withVendor.filter((option) => !option.shipping_profile_id)

  const groups = new Map<string, typeof withVendor>()
  for (const option of withVendor) {
    if (!option.vendor) {
      continue
    }

    const key = groupKey(option.vendor.id, option)
    groups.set(key, [...(groups.get(key) ?? []), option])
  }

  const scoped = Array.from(groups.values()).flatMap((group) => {
    const vendor = group[0].vendor!
    const vendorItems = itemsByVendorId[vendor.id]
    if (!vendorItems) {
      return []
    }

    const locationIds = new Set(
      group
        .map((option) => option.service_zone?.fulfillment_set?.location?.id)
        .filter((id): id is string => Boolean(id)),
    )

    return isInsufficientAcrossLocations(vendorItems, locationIds)
      ? []
      : [group[0]]
  })

  return [...vendorless, ...scoped]
}
