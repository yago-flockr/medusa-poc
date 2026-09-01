import { z } from "@medusajs/framework/zod"
import { shopifyCatalogProvider } from "./shopify/catalog"

export const catalogSourceSchema = z.enum(["shopify"])

export type CatalogSource = z.infer<typeof catalogSourceSchema>

export type ExternalConnectionCredentials = {
  external_account_identifier: string
  access_token: string
}

export type ExternalCatalogItem = {
  externalProductId: string
  variantTitle: string | undefined
  quantity: number
  label: string
}

export type CatalogProvider = {
  checkAvailability(
    credentials: ExternalConnectionCredentials,
    items: ExternalCatalogItem[],
  ): Promise<{ unavailableLabels: string[] }>
  recordSale(
    credentials: ExternalConnectionCredentials,
    items: ExternalCatalogItem[],
  ): Promise<void>
}

export const catalogProviders: Record<CatalogSource, CatalogProvider> = {
  shopify: shopifyCatalogProvider,
}
