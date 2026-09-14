import { z } from "zod"

export const storefrontContentSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  hero_image_url: z.string().nullable(),
})

export type StorefrontContent = z.infer<typeof storefrontContentSchema>

export const updateStorefrontContentSchema = z
  .object({
    name: z
      .string()
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
      })
      .optional(),
    description: z
      .string()
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
      })
      .optional(),
    hero_image_url: z
      .string()
      .transform((value) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
      })
      .optional(),
  })
  .strict()

export type UpdateStorefrontContent = z.infer<
  typeof updateStorefrontContentSchema
>
