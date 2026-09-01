import { z } from "@medusajs/framework/zod"

export const catalogSourceSchema = z.enum(["shopify"])

export type CatalogSource = z.infer<typeof catalogSourceSchema>
