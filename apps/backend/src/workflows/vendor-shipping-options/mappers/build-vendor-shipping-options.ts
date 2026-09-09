type VendorRef = { id: string; name: string }

export function buildVendorShippingOptions<
  TOption extends { shipping_profile_id?: string | null },
>(
  shippingOptions: TOption[],
  vendorByProfileId: Record<string, VendorRef>,
  cartVendorIds: string[],
): (TOption & { vendor: VendorRef | null })[] {
  const cartVendorIdSet = new Set(cartVendorIds)

  return shippingOptions
    .map((option) => ({
      ...option,
      vendor: option.shipping_profile_id
        ? (vendorByProfileId[option.shipping_profile_id] ?? null)
        : null,
    }))
    .filter((option) => !option.vendor || cartVendorIdSet.has(option.vendor.id))
}
