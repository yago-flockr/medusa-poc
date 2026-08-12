import type { HttpTypes } from "@medusajs/framework/types"
import type { Brand } from "../brands/contract"

export type Product = HttpTypes.AdminProduct & {
  brand?: Brand | null
}

export type ProductQuery = {
  fields?: string
}
