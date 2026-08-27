import crypto from "node:crypto"
import { describe, expect, it } from "@jest/globals"
import {
  buildShopifyInstallLink,
  buildShopifyOauthRedirectUri,
  parseRawQuery,
  verifyShopifyCallbackHmac,
} from "../oauth"

function sign(params: Record<string, string>, secret: string): string {
  const message = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&")
  return crypto.createHmac("sha256", secret).update(message).digest("hex")
}

describe("buildShopifyOauthRedirectUri", () => {
  it("uses the real protocol and host for a non-localhost request", () => {
    expect(buildShopifyOauthRedirectUri("https", "medusa-poc.medusajs.app")).toBe(
      "https://medusa-poc.medusajs.app/hooks/shopify/oauth/callback",
    )
  })

  it("swaps in the https://localhost.invalid placeholder for localhost, since Shopify rejects http redirect_uri", () => {
    expect(buildShopifyOauthRedirectUri("http", "localhost:9000")).toBe(
      "https://localhost.invalid/hooks/shopify/oauth/callback",
    )
  })

  it("swaps in the placeholder for 127.0.0.1 too", () => {
    expect(buildShopifyOauthRedirectUri("http", "127.0.0.1:9000")).toBe(
      "https://localhost.invalid/hooks/shopify/oauth/callback",
    )
  })
})

describe("buildShopifyInstallLink", () => {
  it("builds the Shopify authorize URL with the store domain, client id, scopes, and state", () => {
    const installLink = buildShopifyInstallLink({
      storeDomain: "sensus-en0h00hi.myshopify.com",
      clientId: "a0fc51ec861a2347b0decc49bb8310f7",
      state: "test-state-1",
      protocol: "https",
      host: "medusa-poc.medusajs.app",
    })

    const url = new URL(installLink)
    expect(url.origin + url.pathname).toBe(
      "https://sensus-en0h00hi.myshopify.com/admin/oauth/authorize",
    )
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: "a0fc51ec861a2347b0decc49bb8310f7",
      scope: "read_products,read_inventory",
      redirect_uri: "https://medusa-poc.medusajs.app/hooks/shopify/oauth/callback",
      state: "test-state-1",
    })
  })

  it("uses the localhost placeholder redirect_uri when built from a local request", () => {
    const installLink = buildShopifyInstallLink({
      storeDomain: "sensus-en0h00hi.myshopify.com",
      clientId: "a0fc51ec861a2347b0decc49bb8310f7",
      state: "test-state-1",
      protocol: "http",
      host: "localhost:9000",
    })

    const url = new URL(installLink)
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://localhost.invalid/hooks/shopify/oauth/callback",
    )
  })
})

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
