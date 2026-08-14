import { z } from "@medusajs/framework/zod"
import {
  createFindParams,
  createSelectParams,
} from "@medusajs/medusa/api/utils/validators"
import { createBrandSchema, updateBrandSchema } from "./contract"

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

export const AdminCreateBrand = createBrandSchema

export const AdminUpdateBrand = updateBrandSchema
