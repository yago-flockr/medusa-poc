import { z } from "@medusajs/framework/zod"

const cartAffiliateHandleMetadataSchema = z.object({
  affiliate_handle: z.string().min(1),
})

type CartAffiliateHandleMetadata = z.infer<
  typeof cartAffiliateHandleMetadataSchema
>

export function cartAffiliateHandleMetadata(
  affiliateHandle: string,
): CartAffiliateHandleMetadata {
  return { affiliate_handle: affiliateHandle }
}

export function readCartAffiliateHandle(metadata: unknown): string | null {
  const parsed = cartAffiliateHandleMetadataSchema.safeParse(metadata)

  return parsed.success ? parsed.data.affiliate_handle : null
}
