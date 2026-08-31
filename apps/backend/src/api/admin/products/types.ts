import type { HttpTypes } from "@medusajs/framework/types"
import type { Brand } from "@dtc/api-contracts/admin/brands"
import type { Vendor } from "@dtc/api-contracts/admin/vendors"

export type Product = HttpTypes.AdminProduct & {
  brand?: Brand | null
  vendor?: Vendor | null
}

export type ProductQuery = {
  fields?: string
}
