const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

const TOKEN_KEY = "vendor_token"

export const getVendorToken = (): string | null => {
  if (typeof window === "undefined") {
    return null
  }
  return localStorage.getItem(TOKEN_KEY)
}

export const setVendorToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearVendorToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export class VendorApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type ApiErrorBody = { message?: string }

async function request<T>(
  path: string,
  options: { method?: string; authToken?: string; body?: unknown } = {},
): Promise<T> {
  const token = options.authToken ?? getVendorToken()

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

export const loginVendorAdmin = (email: string, password: string) =>
  request<{ token: string }>("/auth/vendor/emailpass", {
    method: "POST",
    body: { email, password },
  })
