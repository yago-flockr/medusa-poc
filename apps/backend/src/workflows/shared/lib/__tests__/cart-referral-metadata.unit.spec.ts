import { describe, expect, it } from "@jest/globals"
import {
  cartReferralMetadata,
  readCartReferralCode,
} from "../cart-referral-metadata"

describe("readCartReferralCode", () => {
  it("reads the code from cart metadata", () => {
    expect(readCartReferralCode({ referral_code: "maria" })).toBe("maria")
  })

  it("returns null when the cart has no metadata", () => {
    expect(readCartReferralCode(null)).toBeNull()
    expect(readCartReferralCode(undefined)).toBeNull()
    expect(readCartReferralCode({})).toBeNull()
  })

  it("returns null for a code that is not a non-empty string", () => {
    expect(readCartReferralCode({ referral_code: "" })).toBeNull()
    expect(readCartReferralCode({ referral_code: 123 })).toBeNull()
    expect(readCartReferralCode({ referral_code: null })).toBeNull()
  })

  it("ignores unrelated metadata", () => {
    expect(readCartReferralCode({ gift_note: "hi", referral_code: "joao" })).toBe(
      "joao",
    )
  })
})

describe("cartReferralMetadata", () => {
  it("returns only its own slice, leaving merging to the caller", () => {
    expect(cartReferralMetadata("maria")).toEqual({ referral_code: "maria" })
  })

  it("composes with other metadata by spreading", () => {
    expect({
      gift_note: "hi",
      ...cartReferralMetadata("joao"),
    }).toEqual({ gift_note: "hi", referral_code: "joao" })
  })

  it("round-trips through the reader", () => {
    expect(readCartReferralCode(cartReferralMetadata("maria"))).toBe("maria")
  })
})
