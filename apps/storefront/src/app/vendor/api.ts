import type { Vendor, VendorOrder, VendorProduct } from "./types"

// Deliberately plain browser fetch + localStorage, not the storefront's usual
// Server Action / httpOnly-cookie pattern (see `lib/data/customer.ts`). This
// section of the app is built SPA-style on purpose — see docs/plan.md
// Decisions — so that if it ever needs its own separate deployment, the
// auth/data layer here already matches what a standalone SPA would need,
// and porting it is not a rewrite.

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

// Thrown by request() so callers can tell "your token is invalid/expired"
// (status 401 — treat as logged out) apart from any other failure (network
// error, validation error, server error — show the message, stay put).
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

export const registerVendorAdmin = (email: string, password: string) =>
  request<{ token: string }>("/auth/vendor/emailpass/register", {
    method: "POST",
    body: { email, password },
  })

export const loginVendorAdmin = (email: string, password: string) =>
  request<{ token: string }>("/auth/vendor/emailpass", {
    method: "POST",
    body: { email, password },
  })

export const createVendor = (
  registrationToken: string,
  input: {
    name: string
    handle?: string
    admin: { email: string; first_name?: string; last_name?: string }
  },
) =>
  request<{ vendor: Vendor }>("/vendors", {
    method: "POST",
    authToken: registrationToken,
    body: input,
  })

export const listVendorProducts = () =>
  request<{ products: VendorProduct[] }>("/vendors/products")

export type VendorProductOption = {
  title: string
  values: string[]
}

export type VendorProductImage = {
  url: string
}

// Separate from request() on purpose: this sends multipart/form-data, and
// the browser must set that header itself (with the multipart boundary) —
// setting it manually, as request() does for JSON, breaks the upload.
export const uploadVendorImages = async (
  files: File[],
): Promise<{ files: { id: string; url: string }[] }> => {
  const token = getVendorToken()
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))

  const res = await fetch(`${BACKEND_URL}/vendors/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  const data: unknown = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message = (data as ApiErrorBody)?.message
    throw new VendorApiError(message ?? `Upload failed (${res.status})`, res.status)
  }

  return data as { files: { id: string; url: string }[] }
}

export type VendorProductVariantInput = {
  optionValues: Record<string, string>
  price: number
  sku?: string
  barcode?: string
  weight?: number
  length?: number
  height?: number
  width?: number
  thumbnail?: string
  images?: VendorProductImage[]
}

export const createVendorProduct = (input: {
  title: string
  description?: string
  images?: VendorProductImage[]
  options?: VendorProductOption[]
  variants: VendorProductVariantInput[]
}) =>
  request<{ product: VendorProduct }>("/vendors/products", {
    method: "POST",
    body: input,
  })

export const updateVendorProduct = (
  id: string,
  input: { title?: string; images?: VendorProductImage[] },
) =>
  request<{ product: VendorProduct }>(`/vendors/products/${id}`, {
    method: "POST",
    body: input,
  })

export const deleteVendorProduct = (id: string) =>
  request<{ id: string; deleted: boolean }>(`/vendors/products/${id}`, {
    method: "DELETE",
  })

export const listVendorOrders = () =>
  request<{ orders: VendorOrder[] }>("/vendors/orders")
