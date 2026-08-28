import type { HttpTypes } from "@medusajs/framework/types"
import type { Brand } from "../brands/contract"
import type { Vendor } from "../vendors/contract"

export type Product = HttpTypes.AdminProduct & {
  brand?: Brand | null
  vendor?: Vendor | null
}

export type ProductQuery = {
  fields?: string
}
