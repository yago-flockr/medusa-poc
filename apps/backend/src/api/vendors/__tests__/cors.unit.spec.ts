import { afterEach, describe, expect, it, jest } from "@jest/globals"

const loadVendorPanelOrigin = (env: {
  VENDOR_CORS?: string
  STORE_CORS?: string
}) => {
  let origin: string | undefined

  jest.isolateModules(() => {
    delete process.env.VENDOR_CORS
    delete process.env.STORE_CORS
    if (env.VENDOR_CORS !== undefined) {
      process.env.VENDOR_CORS = env.VENDOR_CORS
    }
    if (env.STORE_CORS !== undefined) {
      process.env.STORE_CORS = env.STORE_CORS
    }
    origin = require("../cors").vendorPanelOrigin
  })

  return origin
}

describe("vendorPanelOrigin", () => {
  afterEach(() => {
    delete process.env.VENDOR_CORS
    delete process.env.STORE_CORS
  })

  it("ignores a regex entry, which cannot be redirected to", () => {
    expect(
      loadVendorPanelOrigin({ STORE_CORS: "/medusa-poc\\.medusajs\\.site$/" }),
    ).toBeUndefined()
  })

  it("picks the first concrete origin when a regex comes first", () => {
    expect(
      loadVendorPanelOrigin({
        STORE_CORS: "/.*\\.medusajs\\.site$/,https://panel.example.com",
      }),
    ).toBe("https://panel.example.com")
  })

  it("prefers VENDOR_CORS over STORE_CORS", () => {
    expect(
      loadVendorPanelOrigin({
        VENDOR_CORS: "https://vendor.example.com",
        STORE_CORS: "https://store.example.com",
      }),
    ).toBe("https://vendor.example.com")
  })

  it("accepts a plain http origin for local development", () => {
    expect(
      loadVendorPanelOrigin({ VENDOR_CORS: "http://localhost:8000" }),
    ).toBe("http://localhost:8000")
  })

  it("falls back to STORE_CORS when VENDOR_CORS is set but blank", () => {
    expect(
      loadVendorPanelOrigin({
        VENDOR_CORS: "",
        STORE_CORS: "https://store.example.com",
      }),
    ).toBe("https://store.example.com")
  })

  it("is undefined when nothing is configured", () => {
    expect(loadVendorPanelOrigin({})).toBeUndefined()
  })
})
