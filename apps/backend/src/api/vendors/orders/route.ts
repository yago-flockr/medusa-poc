import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [vendorUser],
  } = await query.graph({
    entity: "vendor_user",
    fields: ["vendor.orders.*"],
    filters: {
      id: [req.auth_context.actor_id],
    },
  })

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
