import crypto from "node:crypto"
import { describe, expect, it } from "@jest/globals"
import { parseRawQuery, verifyShopifyCallbackHmac } from "../shopify-oauth"

function sign(params: Record<string, string>, secret: string): string {
  const message = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&")
  return crypto.createHmac("sha256", secret).update(message).digest("hex")
}

describe("parseRawQuery", () => {
  it("parses key-value pairs", () => {
    expect(parseRawQuery("shop=test.myshopify.com&code=abc123")).toEqual({
      shop: "test.myshopify.com",
      code: "abc123",
    })
  })

  it("preserves a literal + character instead of treating it as a space", () => {
    expect(parseRawQuery("host=YWRtaW4+c2hvcA==")).toEqual({
      host: "YWRtaW4+c2hvcA==",
    })
  })

  it("percent-decodes keys and values", () => {
    expect(parseRawQuery("a%20b=c%3Dd")).toEqual({ "a b": "c=d" })
  })

  it("returns an empty object for an empty string", () => {
    expect(parseRawQuery("")).toEqual({})
  })

  it("defaults a key with no = to an empty string value", () => {
    expect(parseRawQuery("flag")).toEqual({ flag: "" })
  })
})

describe("verifyShopifyCallbackHmac", () => {
  const secret = "test-client-secret"

  it("returns true for a correctly signed query", () => {
    const params = { code: "abc123", shop: "test.myshopify.com", timestamp: "123" }
    const query = { ...params, hmac: sign(params, secret) }

    expect(verifyShopifyCallbackHmac(query, secret)).toBe(true)
  })

  it("is independent of key order when signing", () => {
    const params = { shop: "test.myshopify.com", code: "abc123", timestamp: "123" }
    const hmac = sign({ code: "abc123", shop: "test.myshopify.com", timestamp: "123" }, secret)

    expect(verifyShopifyCallbackHmac({ ...params, hmac }, secret)).toBe(true)
  })

  it("returns false when hmac is missing", () => {
    expect(verifyShopifyCallbackHmac({ shop: "test.myshopify.com" }, secret)).toBe(false)
  })

  it("returns false when a value was tampered with", () => {
    const params = { code: "abc123", shop: "test.myshopify.com" }
    const hmac = sign(params, secret)

    expect(
      verifyShopifyCallbackHmac({ ...params, shop: "evil.myshopify.com", hmac }, secret),
    ).toBe(false)
  })

  it("returns false (not throw) when hmac has a different length than the digest", () => {
    const params = { code: "abc123", shop: "test.myshopify.com" }

    expect(() =>
      verifyShopifyCallbackHmac({ ...params, hmac: "too-short" }, secret),
    ).not.toThrow()
    expect(verifyShopifyCallbackHmac({ ...params, hmac: "too-short" }, secret)).toBe(false)
  })

  it("returns false when signed with a different secret", () => {
    const params = { code: "abc123", shop: "test.myshopify.com" }
    const hmac = sign(params, "wrong-secret")

    expect(verifyShopifyCallbackHmac({ ...params, hmac }, secret)).toBe(false)
  })
})
