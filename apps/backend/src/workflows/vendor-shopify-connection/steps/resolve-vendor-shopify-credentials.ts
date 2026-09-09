import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { assertShopifyConnectionCredentials } from "../../../integrations/shopify/helpers/assert-shopify-connection-credentials"
import type { ShopifyStoreCredentials } from "../../../integrations/shopify/client"

const vendorShopifyCredentialsSchema = z.object({
  integration_connections: z
    .array(
      z.object({
        provider: z.string(),
        external_account_identifier: z.string().nullable(),
        access_token: z.string().nullable(),
      }),
    )
    .nullable(),
})

export type ResolveVendorShopifyCredentialsStepInput = {
  vendorId: string
}

export const resolveVendorShopifyCredentialsStep = createStep(
  "resolve-vendor-shopify-credentials",
  async (
    { vendorId }: ResolveVendorShopifyCredentialsStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const {
      data: [rawVendor],
    } = await query.graph({
      entity: "vendor",
      fields: [
        "integration_connections.provider",
        "integration_connections.external_account_identifier",
        "integration_connections.access_token",
      ],
      filters: { id: vendorId },
    })
    const vendor = vendorShopifyCredentialsSchema.parse(rawVendor)
    const connection = (vendor.integration_connections ?? []).find(
      (candidate) => candidate.provider === "shopify",
    )

    assertShopifyConnectionCredentials(connection)

    return new StepResponse<ShopifyStoreCredentials>({
      storeDomain: connection.external_account_identifier,
      accessToken: connection.access_token,
    })
  },
)
