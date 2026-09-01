import { MedusaError } from "@medusajs/framework/utils"
import type { BigNumberValue, RemoteQueryFunction } from "@medusajs/framework/types"
import {
  catalogSourceSchema,
  type CatalogSource,
  type ExternalCatalogItem,
  type ExternalConnectionCredentials,
} from "./catalog-provider"

export type CatalogItemSource = {
  product_id?: string | null
  variant_title?: string | null
  product_title?: string | null
  title: string
  quantity: BigNumberValue
}

export type ExternalCatalogGroup = {
  provider: CatalogSource
  credentials: ExternalConnectionCredentials
  items: ExternalCatalogItem[]
}

export async function resolveExternalCatalogGroups(
  query: Omit<RemoteQueryFunction, symbol>,
  items: CatalogItemSource[],
): Promise<Map<string, ExternalCatalogGroup>> {
  const groups = new Map<string, ExternalCatalogGroup>()

  const productIds = [
    ...new Set(
      items.map((item) => item.product_id).filter((id): id is string => Boolean(id)),
    ),
  ]

  if (!productIds.length) {
    return groups
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "external_id",
      "metadata",
      "vendor.id",
      "vendor.integration_connections.provider",
      "vendor.integration_connections.external_account_identifier",
      "vendor.integration_connections.access_token",
    ],
    filters: { id: productIds },
  })

  const externalMetaByProductId = new Map<
    string,
    { externalId: string; provider: CatalogSource; vendorId: string }
  >()

  for (const product of products) {
    const rawSource = (product.metadata as Record<string, unknown> | null)?.external_source
    const parsedSource = catalogSourceSchema.safeParse(rawSource)

    if (!product.external_id || !parsedSource.success || !product.vendor?.id) {
      continue
    }

    externalMetaByProductId.set(product.id, {
      externalId: product.external_id,
      provider: parsedSource.data,
      vendorId: product.vendor.id,
    })
  }

  if (!externalMetaByProductId.size) {
    return groups
  }

  for (const item of items) {
    const meta = item.product_id ? externalMetaByProductId.get(item.product_id) : undefined

    if (!meta) {
      continue
    }

    const groupKey = `${meta.vendorId}:${meta.provider}`
    let group = groups.get(groupKey)

    if (!group) {
      const vendorProduct = products.find((p) => p.vendor?.id === meta.vendorId)
      const connection = vendorProduct?.vendor?.integration_connections?.find(
        (c) => c?.provider === meta.provider,
      )

      if (!connection?.external_account_identifier || !connection.access_token) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          `This vendor isn't connected to ${meta.provider} yet.`,
        )
      }

      group = {
        provider: meta.provider,
        credentials: {
          external_account_identifier: connection.external_account_identifier,
          access_token: connection.access_token,
        },
        items: [],
      }
      groups.set(groupKey, group)
    }

    group.items.push({
      externalProductId: meta.externalId,
      variantTitle: item.variant_title ?? undefined,
      quantity: Number(item.quantity),
      label: item.product_title ?? item.title,
    })
  }

  return groups
}
