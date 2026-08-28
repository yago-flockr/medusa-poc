import { MedusaError } from "@medusajs/framework/utils"

export function assertShopifyConnectionCredentials<
  T extends {
    external_account_identifier: string | null
    access_token: string | null
  },
>(
  connection: T | null | undefined,
): asserts connection is T & {
  external_account_identifier: string
  access_token: string
} {
  if (!connection?.external_account_identifier || !connection.access_token) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This vendor isn't connected to Shopify yet.",
    )
  }
}
