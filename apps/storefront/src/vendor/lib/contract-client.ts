import { initClient } from "@ts-rest/core"
import { vendorContract } from "@dtc/api-contracts/vendor/contract"
import { useVendorAuthStore } from "../stores/auth-store"
import { assertOkResponse } from "./client"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

export const vendorClient = initClient(vendorContract, {
  baseUrl: BACKEND_URL,
  validateResponse: true,
  api: async ({ path, method, headers, body }) => {
    const token = useVendorAuthStore.getState().token

    const res = await fetch(path, {
      method,
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
    })

    const data: unknown = await res.json().catch(() => ({}))
    assertOkResponse(res, data, path)

    return { status: res.status, body: data, headers: res.headers }
  },
})
