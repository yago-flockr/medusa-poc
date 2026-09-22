import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"

import { graph } from "../../../lib/query"
const vendorShopifyConnectionSchema = z.object({
  integration_connections: z
    .array(
      z.object({
        provider: z.string(),
        external_account_identifier: z.string().nullable(),
        client_id: z.string().nullable(),
      }),
    )
    .nullable(),
})

export type ResolveVendorShopifyConnectionStepInput = {
  vendorId: string
  notConfiguredMessage: string
}

export const resolveVendorShopifyConnectionStep = createStep(
  "resolve-vendor-shopify-connection",
  async (
    { vendorId, notConfiguredMessage }: ResolveVendorShopifyConnectionStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [rawVendor],
    } = await graph(query, {
      entity: "vendor",
      fields: [
        "integration_connections.provider",
        "integration_connections.external_account_identifier",
        "integration_connections.client_id",
      ],
      filters: { id: vendorId },
    })

    const vendor = vendorShopifyConnectionSchema.parse(rawVendor)
    const shopify = (vendor.integration_connections ?? []).find(
      (connection) => connection.provider === "shopify",
    )

    if (!shopify?.external_account_identifier || !shopify.client_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        notConfiguredMessage,
      )
    }

    return new StepResponse({
      storeDomain: shopify.external_account_identifier,
      clientId: shopify.client_id,
    })
  },
)
