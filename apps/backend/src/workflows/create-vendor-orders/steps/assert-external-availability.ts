import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError, promiseAll } from "@medusajs/framework/utils"
import type { CartLineItemDTO } from "@medusajs/framework/types"
import {
  catalogProviders,
  catalogSourceSchema,
  type CatalogSource,
  type ExternalAvailabilityCheckItem,
  type ExternalConnectionCredentials,
} from "../../../integrations/catalog-provider"

export type AssertExternalAvailabilityStepInput = {
  items: CartLineItemDTO[]
}

type ProviderGroup = {
  provider: CatalogSource
  credentials: ExternalConnectionCredentials
  items: ExternalAvailabilityCheckItem[]
}

// Products created internally (no external_id) never reach this loop —
// they're a marketplace-native product, so there's nothing external to
// verify. A Shopify- (or, later, WooCommerce-) sourced product's stock can
// drift out from under us between the customer's cart and this moment, so
// each one is re-checked against whichever source it actually came from,
// not against whatever connection the vendor happens to have.
export const assertExternalAvailabilityStep = createStep(
  "assert-external-availability",
  async ({ items }: AssertExternalAvailabilityStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const productIds = [
      ...new Set(
        items.map((item) => item.product_id).filter((id): id is string => Boolean(id)),
      ),
    ]

    if (!productIds.length) {
      return new StepResponse(undefined)
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
      return new StepResponse(undefined)
    }

    const groups = new Map<string, ProviderGroup>()

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
        variantTitle: item.variant_title,
        quantity: Number(item.quantity),
        label: item.product_title ?? item.title,
      })
    }

    const results = await promiseAll(
      [...groups.values()].map((group) =>
        catalogProviders[group.provider].checkAvailability(group.credentials, group.items),
      ),
    )

    const unavailable = results.flatMap((result) => result.unavailableLabels)

    if (unavailable.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot complete this order — no longer available from the vendor: ${unavailable.join(", ")}.`,
      )
    }

    return new StepResponse(undefined)
  },
)
