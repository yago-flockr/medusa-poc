import { z } from "zod"

export const loginVendorInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export type LoginVendorInput = z.infer<typeof loginVendorInputSchema>

export const loginVendorResponseSchema = z.object({
  token: z.string(),
})

export type LoginVendorResponse = z.infer<typeof loginVendorResponseSchema>
