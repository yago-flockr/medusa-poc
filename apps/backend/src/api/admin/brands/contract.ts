import { z } from "@medusajs/framework/zod"
import type { CustomListQuery } from "../list-response"
import { AdminGetBrandsParamsFields } from "./validators"

export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
})

export type Brand = z.infer<typeof brandSchema>

export type BrandListQuery = CustomListQuery &
  Partial<z.infer<typeof AdminGetBrandsParamsFields>>
