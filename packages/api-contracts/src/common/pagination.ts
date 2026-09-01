import { z } from "zod"

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>

// The metadata every paginated list response carries, regardless of what
// it's a list of. `estimate_count` is Medusa's own (only ever present on
// responses built from a Medusa query under the `index_engine` feature
// flag) — kept optional here rather than split into a second schema, since
// every consumer already treats it as optional.
export const paginationMetaSchema = z.object({
  count: z.number(),
  limit: z.number(),
  offset: z.number(),
  estimate_count: z.number().optional(),
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>
