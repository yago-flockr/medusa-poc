import {
  toIsoString,
  toIsoStringOrNull,
} from "../../../lib/normalize-timestamps"

type RawAffiliate = {
  created_at: string | Date
  updated_at: string | Date
  deleted_at?: string | Date | null
  storefront_content?: {
    name: string | null
    description: string | null
    hero_image_url: string | null
  } | null
} & Record<string, unknown>

export function buildAffiliate<T extends RawAffiliate>(
  affiliate: T,
): Omit<
  T,
  "created_at" | "updated_at" | "deleted_at" | "storefront_content"
> & {
  created_at: string
  updated_at: string
  deleted_at: string | null
  storefront_content: {
    name: string | null
    description: string | null
    hero_image_url: string | null
  } | null
} {
  const {
    created_at,
    updated_at,
    deleted_at,
    storefront_content: storefrontContent,
    ...rest
  } = affiliate

  return {
    ...rest,
    created_at: toIsoString(created_at),
    updated_at: toIsoString(updated_at),
    deleted_at: toIsoStringOrNull(deleted_at),
    storefront_content: storefrontContent ?? null,
  }
}
