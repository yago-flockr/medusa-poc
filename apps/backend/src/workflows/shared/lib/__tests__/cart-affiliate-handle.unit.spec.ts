import { describe, expect, it } from "@jest/globals"
import {
  cartAffiliateHandleMetadata,
  readCartAffiliateHandle,
} from "../cart-affiliate-handle"

describe("readCartAffiliateHandle", () => {
  it("reads the code from cart metadata", () => {
    expect(readCartAffiliateHandle({ affiliate_handle: "maria" })).toBe("maria")
  })

  it("returns null when the cart has no metadata", () => {
    expect(readCartAffiliateHandle(null)).toBeNull()
    expect(readCartAffiliateHandle(undefined)).toBeNull()
    expect(readCartAffiliateHandle({})).toBeNull()
  })

  it("returns null for a code that is not a non-empty string", () => {
    expect(readCartAffiliateHandle({ affiliate_handle: "" })).toBeNull()
    expect(readCartAffiliateHandle({ affiliate_handle: 123 })).toBeNull()
    expect(readCartAffiliateHandle({ affiliate_handle: null })).toBeNull()
  })

  it("ignores unrelated metadata", () => {
    expect(
      readCartAffiliateHandle({ gift_note: "hi", affiliate_handle: "joao" }),
    ).toBe("joao")
  })
})

describe("cartAffiliateHandleMetadata", () => {
  it("returns only its own slice, leaving merging to the caller", () => {
    expect(cartAffiliateHandleMetadata("maria")).toEqual({
      affiliate_handle: "maria",
    })
  })

  it("composes with other metadata by spreading", () => {
    expect({
      gift_note: "hi",
      ...cartAffiliateHandleMetadata("joao"),
    }).toEqual({ gift_note: "hi", affiliate_handle: "joao" })
  })

  it("round-trips through the reader", () => {
    expect(readCartAffiliateHandle(cartAffiliateHandleMetadata("maria"))).toBe(
      "maria",
    )
  })
})
