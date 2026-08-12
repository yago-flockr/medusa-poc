import { z } from "@medusajs/framework/zod"
import {
  createFindParams,
  createSelectParams,
} from "@medusajs/medusa/api/utils/validators"

export const AdminGetBrandParams = createSelectParams()

export const AdminGetBrandsParamsFields = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  handle: z.string().optional(),
})

export const AdminGetBrandsParams = createFindParams({
  limit: 20,
  offset: 0,
}).merge(AdminGetBrandsParamsFields)

export const AdminCreateBrand = z
  .object({
    name: z.string().trim().min(1),
    handle: z.string().trim().min(1).optional(),
  })
  .strict()

export const AdminUpdateBrand = z
  .object({
    name: z.string().trim().min(1).optional(),
    handle: z.string().trim().min(1).optional(),
  })
  .strict()
  .refine((data) => data.name !== undefined || data.handle !== undefined, {
    message: "At least one of name or handle is required",
  })
