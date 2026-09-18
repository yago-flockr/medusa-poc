import { describe, expect, it } from "@jest/globals"
import {
  affiliateListFiltersSchema,
  createAffiliateSchema,
} from "@dtc/api-contracts/admin/affiliates"

describe("createAffiliateSchema", () => {
  it("trims and lowercases the email", () => {
    const result = createAffiliateSchema.parse({
      name: "Maria Silva",
      email: "  Maria@Example.COM ",
      commission_rate: 0.1,
    })
    expect(result.email).toBe("maria@example.com")
  })

  it("treats a blank handle as absent, so the name derives it later", () => {
    const result = createAffiliateSchema.parse({
      name: "Maria Silva",
      email: "maria@example.com",
      handle: "   ",
      commission_rate: 0.1,
    })
    expect(result.handle).toBeUndefined()
  })

  it("rejects a commission rate outside 0..1, since it is a fraction", () => {
    const base = { name: "M", email: "m@e.com" }
    expect(() =>
      createAffiliateSchema.parse({ ...base, commission_rate: 1.5 }),
    ).toThrow()
    expect(() =>
      createAffiliateSchema.parse({ ...base, commission_rate: -0.1 }),
    ).toThrow()
    expect(
      createAffiliateSchema.parse({ ...base, commission_rate: 1 })
        .commission_rate,
    ).toBe(1)
  })

  it("rejects fields the caller does not own, like is_active", () => {
    expect(() =>
      createAffiliateSchema.parse({
        name: "M",
        email: "m@e.com",
        commission_rate: 0.1,
        is_active: false,
      }),
    ).toThrow()
  })
})

describe("affiliateListFiltersSchema is_active", () => {
  it("reads the query string 'false' as false, not as a truthy string", () => {
    expect(affiliateListFiltersSchema.parse({ is_active: "false" })).toEqual({
      is_active: false,
    })
  })

  it("accepts 'true' and real booleans alike", () => {
    expect(affiliateListFiltersSchema.parse({ is_active: "true" })).toEqual({
      is_active: true,
    })
    expect(affiliateListFiltersSchema.parse({ is_active: true })).toEqual({
      is_active: true,
    })
  })

  it("rejects anything that is not a boolean answer", () => {
    expect(() =>
      affiliateListFiltersSchema.parse({ is_active: "maybe" }),
    ).toThrow()
  })
})
