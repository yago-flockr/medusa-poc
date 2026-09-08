import { describe, expect, it } from "@jest/globals"
import { buildFreeShippingOptionInput } from "../build-free-shipping-option-input"

describe("buildFreeShippingOptionInput", () => {
  it("builds a zero-amount flat rate option for every store currency", () => {
    const [option] = buildFreeShippingOptionInput({
      serviceZoneId: "zone_1",
      shippingProfileId: "profile_1",
    })

    expect(option.name).toBe("Free Shipping")
    expect(option.price_type).toBe("flat")
    expect(option.provider_id).toBe("manual_manual")
    expect(option.service_zone_id).toBe("zone_1")
    expect(option.shipping_profile_id).toBe("profile_1")
    expect(option.prices.length).toBeGreaterThan(0)
    expect(option.prices.every((price) => price.amount === 0)).toBe(true)
  })

  it("scopes the option to enabled-in-store, non-return shipments", () => {
    const [option] = buildFreeShippingOptionInput({
      serviceZoneId: "zone_1",
      shippingProfileId: "profile_1",
    })

    expect(option.rules).toEqual([
      { attribute: "enabled_in_store", value: "true", operator: "eq" },
      { attribute: "is_return", value: "false", operator: "eq" },
    ])
  })
})
