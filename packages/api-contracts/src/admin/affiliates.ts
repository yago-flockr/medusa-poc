import { z } from "zod"
import type { FindParams } from "@medusajs/types"
import { booleanStringSchema } from "@dtc/api-contracts/common/boolean-string"
import { AFFILIATE_HANDLE_MAX_LENGTH } from "@dtc/api-contracts/common/cart-affiliate"
import { paginationMetaSchema } from "@dtc/api-contracts/common/pagination"

export const affiliateSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  email: z.string(),
  commission_rate: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
})

export type Affiliate = z.infer<typeof affiliateSchema>

export const affiliateListFiltersSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  handle: z.string().optional(),
  email: z.string().optional(),
  is_active: booleanStringSchema.optional(),
})

export type AffiliateListQuery = FindParams &
  z.infer<typeof affiliateListFiltersSchema>

export const affiliateListResponseSchema = paginationMetaSchema.extend({
  affiliates: z.array(affiliateSchema),
})

export type AffiliateListResponse = z.infer<typeof affiliateListResponseSchema>

export const affiliateResponseSchema = z.object({
  affiliate: affiliateSchema,
})

export type AffiliateResponse = z.infer<typeof affiliateResponseSchema>

const commissionRateSchema = z
  .number()
  .min(0, "Commission rate cannot be negative")
  .max(1, "Commission rate is a fraction, so it cannot exceed 1")

export const createAffiliateSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().toLowerCase().pipe(z.email("Email is invalid")),
    handle: z
      .string()
      .max(AFFILIATE_HANDLE_MAX_LENGTH)
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
      })
      .optional(),
    commission_rate: commissionRateSchema,
  })
  .strict()

export type CreateAffiliate = z.infer<typeof createAffiliateSchema>

export const updateAffiliateSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Email is invalid"))
      .optional(),
    handle: z
      .string()
      .trim()
      .min(1, "Handle is required")
      .max(AFFILIATE_HANDLE_MAX_LENGTH)
      .optional(),
    commission_rate: commissionRateSchema.optional(),
    is_active: z.boolean().optional(),
  })
  .strict()

export type UpdateAffiliate = z.infer<typeof updateAffiliateSchema>

export const affiliateDeleteResponseSchema = z.object({
  id: z.string(),
  object: z.literal("affiliate"),
  deleted: z.boolean(),
})

export type AffiliateDeleteResponse = z.infer<
  typeof affiliateDeleteResponseSchema
>
