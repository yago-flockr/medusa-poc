import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows"
import { resolveVendorUser } from "../resolve-vendor-user"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor.orders.*",
  ])

  const orderIds = (vendorUser.vendor.orders ?? [])
    .filter((order): order is NonNullable<typeof order> => order != null)
    .map((order) => order.id)

  const { result: orders } = await getOrdersListWorkflow(req.scope).run({
    input: {
      fields: [
        "id",
        "display_id",
        "status",
        "total",
        "currency_code",
        "items.*",
        "metadata",
      ],
      variables: {
        filters: { id: orderIds },
      },
    },
  })

  res.json({ orders })
}
