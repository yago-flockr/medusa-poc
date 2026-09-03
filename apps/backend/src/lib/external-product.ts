export type ExternalProduct = {
  external_id: string
  external_source: string
  title: string
  description: string
  handle: string
  image_urls: string[]
  options: { name: string; values: string[] }[]
  variants: {
    title: string
    sku: string | null
    price: string
    options: { name: string; value: string }[]
  }[]
}
