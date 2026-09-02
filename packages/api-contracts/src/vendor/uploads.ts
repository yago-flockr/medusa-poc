import { z } from "zod"

export const vendorUploadedFileSchema = z.object({
  id: z.string(),
  url: z.string(),
})

export type VendorUploadedFile = z.infer<typeof vendorUploadedFileSchema>

export const postVendorsUploadsResponseSchema = z.object({
  files: z.array(vendorUploadedFileSchema),
})

export type PostVendorsUploadsResponse = z.infer<
  typeof postVendorsUploadsResponseSchema
>
