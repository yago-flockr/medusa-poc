import { z } from "@medusajs/framework/zod"

const title = z.string().trim().min(1, "Title is required")
const subtitle = z.string().trim().min(1).optional()
const description = z.string().trim().min(1).optional()
const handle = z.string().trim().min(1).optional()
const price = z.number().positive("Price must be greater than 0")
const sku = z.string().trim().min(1).optional()
const barcode = z.string().trim().min(1).optional()
const dimension = z.number().positive().optional()

const productOption = z
  .object({
    title: z.string().trim().min(1),
    values: z.array(z.string().trim().min(1)).min(1).max(20),
  })
  .strict()

const options = z.array(productOption).max(5).optional()

const productImage = z.object({ url: z.string().url() }).strict()
const images = z.array(productImage).max(5).optional()

const variant = z
  .object({
    optionValues: z.record(z.string(), z.string()),
    price,
    sku,
    barcode,
    weight: dimension,
    length: dimension,
    height: dimension,
    width: dimension,
  })
  .strict()

const variants = z.array(variant).min(1).max(50)

export const createVendorProductSchema = z
  .object({
    title,
    subtitle,
    description,
    handle,
    images,
    options,
    variants,
  })
  .strict()

export type CreateVendorProduct = z.infer<typeof createVendorProductSchema>

export const updateVendorProductSchema = z
  .object({
    title: title.optional(),
    subtitle,
    description,
    handle,
    images,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })

export type UpdateVendorProduct = z.infer<typeof updateVendorProductSchema>
