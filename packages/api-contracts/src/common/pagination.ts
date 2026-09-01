import { z } from "zod"

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export const paginationMetaSchema = z.object({
  count: z.number(),
  limit: z.number(),
  offset: z.number(),
  estimate_count: z.number().optional(),
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>
