import type { Brand } from "@dtc/api-contracts/admin/brands"
import {
  toIsoString,
  toIsoStringOrNull,
} from "../../../lib/normalize-timestamps"

type RawBrand = {
  id: string
  name: string
  handle: string
  created_at: string | Date
  updated_at: string | Date
  deleted_at: string | Date | null | undefined
}

export function buildBrand(brand: RawBrand): Brand {
  return {
    id: brand.id,
    name: brand.name,
    handle: brand.handle,
    created_at: toIsoString(brand.created_at),
    updated_at: toIsoString(brand.updated_at),
    deleted_at: toIsoStringOrNull(brand.deleted_at),
  }
}
