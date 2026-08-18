export type Vendor = {
  id: string
  name: string
  handle: string
}

export type VendorProductVariant = {
  id: string
  title: string
  sku: string | null
  thumbnail: string | null
  prices: { currency_code: string; amount: number }[]
}

export type VendorProduct = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  handle: string | null
  status: string
  variants?: VendorProductVariant[]
  images?: { id: string; url: string }[]
}

export type VendorOrder = {
  id: string
  status: string
  total?: number
  currency_code?: string
  items?: { id: string; title: string }[]
}
