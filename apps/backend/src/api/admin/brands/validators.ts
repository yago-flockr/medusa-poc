import { z } from "@medusajs/framework/zod"
import {
  createFindParams,
  createSelectParams,
} from "@medusajs/medusa/api/utils/validators"

export const PostAdminCreateBrand = z.object({
  name: z.string(),
})

export const GetBrandsSchema = createFindParams().merge(
  z.object({
    id: z.string().optional(),
    name: z.string().optional(),
  })
)

export const GetBrandSchema = createSelectParams()
