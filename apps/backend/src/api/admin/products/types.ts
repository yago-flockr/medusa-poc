import { z } from "zod"
import { brandSchema } from "@dtc/api-contracts/admin/brands"
import { vendorSchema } from "@dtc/api-contracts/admin/vendors"

export const productLinksSchema = z.object({
  brand: brandSchema.pick({ id: true, name: true, handle: true }).nullish(),
  vendor: vendorSchema.pick({ id: true, name: true, handle: true }).nullish(),
})

export type ProductLinks = z.infer<typeof productLinksSchema>

export type ProductQuery = {
  fields?: string
}
