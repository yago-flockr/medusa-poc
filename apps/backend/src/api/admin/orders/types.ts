import type { HttpTypes } from "@medusajs/framework/types"
import type { Affiliate } from "@dtc/api-contracts/admin/affiliates"

export type Order = HttpTypes.AdminOrder & {
  referral?: {
    commission_rate: number
    commission_total: number
    affiliate: Pick<Affiliate, "name" | "handle">
  } | null
}

export type OrderQuery = {
  fields?: string
}
