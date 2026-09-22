import { afterEach, describe, expect, it, jest } from "@jest/globals"

type Handler = (req: unknown, res: unknown, next: () => void) => void

const loadPanelCors = (storeCors: string): Handler => {
  let cors: Handler | undefined

  jest.isolateModules(() => {
    process.env.STORE_CORS = storeCors
    cors = require("../panel-cors").panelCors
  })

  return cors as Handler
}

const allowedOriginFor = (cors: Handler, origin: string) => {
  const headers: Record<string, string> = {}
  const res = {
    setHeader: (key: string, value: string) => {
      headers[key] = value
    },
    sendStatus: () => undefined,
  }

  cors({ headers: { origin }, method: "GET" }, res, () => undefined)

  return headers["Access-Control-Allow-Origin"]
}

describe("panelCors", () => {
  afterEach(() => {
    delete process.env.STORE_CORS
  })

  it("allows an origin listed in STORE_CORS", () => {
    const cors = loadPanelCors("http://localhost:8000")
    expect(allowedOriginFor(cors, "http://localhost:8000")).toBe(
      "http://localhost:8000",
    )
  })

  // Cloud auto-configures STORE_CORS as a regex, because a preview
  // deployment's domain is not known ahead of time.
  it("allows an origin matching a regex STORE_CORS entry", () => {
    const cors = loadPanelCors("/^https:\\/\\/.*\\.medusajs\\.app$/")
    expect(allowedOriginFor(cors, "https://medusa-poc.medusajs.app")).toBe(
      "https://medusa-poc.medusajs.app",
    )
  })

  it("sends no CORS header to an origin that is not allowed", () => {
    const cors = loadPanelCors("/^https:\\/\\/.*\\.medusajs\\.app$/")
    expect(allowedOriginFor(cors, "https://evil.example.com")).toBeUndefined()
  })

  it("sends no CORS header when STORE_CORS is unset", () => {
    const cors = loadPanelCors("")
    expect(allowedOriginFor(cors, "http://localhost:8000")).toBeUndefined()
  })
})
