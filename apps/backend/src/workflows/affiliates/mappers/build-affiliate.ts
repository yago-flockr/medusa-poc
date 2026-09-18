import {
  toIsoString,
  toIsoStringOrNull,
} from "../../../lib/normalize-timestamps"

type RawAffiliate = {
  created_at: string | Date
  updated_at: string | Date
  deleted_at?: string | Date | null
} & Record<string, unknown>

export function buildAffiliate<T extends RawAffiliate>(
  affiliate: T,
): Omit<T, "created_at" | "updated_at" | "deleted_at"> & {
  created_at: string
  updated_at: string
  deleted_at: string | null
} {
  const { created_at, updated_at, deleted_at, ...rest } = affiliate

  return {
    ...rest,
    created_at: toIsoString(created_at),
    updated_at: toIsoString(updated_at),
    deleted_at: toIsoStringOrNull(deleted_at),
  }
}
