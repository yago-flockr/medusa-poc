import { z } from "@medusajs/framework/zod"
import { shopifyCatalogProvider } from "./shopify/availability"

// Every provider a vendor's catalogue can come from — Shopify today, more
// later. Adding one means adding a value here, a `CatalogProvider`
// implementation under `integrations/<provider>/`, and an entry in
// `catalogProviders` below; nothing that reads `CatalogSource` needs to
// change.
export const catalogSourceSchema = z.enum(["shopify"])

export type CatalogSource = z.infer<typeof catalogSourceSchema>

export type ExternalConnectionCredentials = {
  external_account_identifier: string
  access_token: string
}

export type ExternalAvailabilityCheckItem = {
  externalProductId: string
  variantTitle: string | undefined
  quantity: number
  label: string
}

export type CatalogProvider = {
  checkAvailability(
    credentials: ExternalConnectionCredentials,
    items: ExternalAvailabilityCheckItem[],
  ): Promise<{ unavailableLabels: string[] }>
}

export const catalogProviders: Record<CatalogSource, CatalogProvider> = {
  shopify: shopifyCatalogProvider,
}
