import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import {
  getVendorsOrdersByIdResponseSchema,
  type PostVendorsOrdersByIdDispatchInput,
} from "@dtc/api-contracts/vendor/orders"
import { dispatchConsignmentWorkflow } from "../../../../../workflows/dispatch-consignment"
import { resolveVendorUser } from "../../../resolve-vendor-user"
import { assertOwnedConsignment } from "../../assert-owned-consignment"
import { buildConsignmentDetail } from "../../build-consignment-detail"

export const POST = async (
  req: AuthenticatedMedusaRequest<PostVendorsOrdersByIdDispatchInput>,
  res: MedusaResponse,
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const vendorUser = await resolveVendorUser(query, req.auth_context.actor_id, [
    "vendor_id",
  ])

  await assertOwnedConsignment(query, id, vendorUser.vendor_id)

  const current = await buildConsignmentDetail(req.scope, id)

  if (current.consignment_status !== "accepted") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Accept this order before dispatching it.",
    )
  }

  const {
    data: [consignment],
  } = await query.graph({
    entity: "consignment",
    fields: ["id", "order.id"],
    filters: { id },
  })

  const orderId = consignment?.order?.id
  if (!orderId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order with id: ${id} was not found`,
    )
  }

  // createOrderFulfillmentWorkflow otherwise defaults both the fulfillment's
  // location and its shipping option to the order's first shipping method —
  // the same one for every vendor on the order, regardless of whose item it
  // actually is. Passing this vendor's own location and shipping option
  // explicitly is what makes the fulfillment show the right warehouse (and
  // use the right shipping method) in Admin once an order can carry more
  // than one shipping method (one per vendor).
  const {
    data: [vendorLocation],
  } = await query.graph({
    entity: "stock_location",
    fields: ["id", "fulfillment_sets.service_zones.shipping_options.id"],
    filters: { vendor: { id: vendorUser.vendor_id } },
  })

  if (!vendorLocation?.id) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "This vendor has no stock location to dispatch from.",
    )
  }

  const shippingOptionId = vendorLocation.fulfillment_sets
    ?.flatMap((set) => set?.service_zones ?? [])
    .flatMap((zone) => zone?.shipping_options ?? [])
    .find((option) => option?.id)?.id

  if (!shippingOptionId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "This vendor's stock location has no shipping option to dispatch with.",
    )
  }

  const { tracking_number, tracking_url } = req.validatedBody

  await dispatchConsignmentWorkflow(req.scope).run({
    input: {
      consignmentId: id,
      orderId,
      locationId: vendorLocation.id,
      shippingOptionId,
      items: current.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
      trackingNumber: tracking_number,
      trackingUrl: tracking_url,
    },
  })

  const detail = await buildConsignmentDetail(req.scope, id)

  res.json(getVendorsOrdersByIdResponseSchema.parse(detail))
}
