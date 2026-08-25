import { useVendorAuthStore } from "../stores/auth-store"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

export class VendorApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type ApiErrorBody = { message?: string }

export async function request<T>(
  path: string,
  options: { method?: string; authToken?: string; body?: unknown } = {},
): Promise<T> {
  const token = options.authToken ?? useVendorAuthStore.getState().token

  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data: unknown = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message = (data as ApiErrorBody)?.message
    throw new VendorApiError(
      message ?? `Request to ${path} failed (${res.status})`,
      res.status,
    )
  }

  return data as T
}
