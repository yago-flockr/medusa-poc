import { z } from "zod"

export const postAuthVendorEmailpassInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export type PostAuthVendorEmailpassInput = z.infer<
  typeof postAuthVendorEmailpassInputSchema
>

export const postAuthVendorEmailpassResponseSchema = z.object({
  token: z.string(),
})

export type PostAuthVendorEmailpassResponse = z.infer<
  typeof postAuthVendorEmailpassResponseSchema
>
