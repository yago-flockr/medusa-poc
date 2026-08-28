import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { LinkDefinition } from "@medusajs/framework/types"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"

export type DeleteVendorStepInput = {
  id: string
}

type DeleteVendorCompensation = {
  id: string
  userIds: string[]
  connectionIds: string[]
  links: LinkDefinition[]
}

export const deleteVendorStep = createStep(
  "delete-vendor",
  async (input: DeleteVendorStepInput, { container }) => {
    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const link = container.resolve(ContainerRegistrationKeys.LINK)

    await vendorModuleService.retrieveVendor(input.id)

    const {
      data: [vendor],
    } = await query.graph({
      entity: "vendor",
      filters: { id: input.id },
      fields: ["id", "users.id", "integration_connections.id", "products.id"],
    })

    const userIds = (vendor?.users ?? [])
      .filter((user): user is NonNullable<typeof user> => user != null)
      .map((user) => user.id)
    const connectionIds = (vendor?.integration_connections ?? [])
      .filter(
        (connection): connection is NonNullable<typeof connection> =>
          connection != null,
      )
      .map((connection) => connection.id)
    const products = (vendor?.products ?? []).filter(
      (product): product is NonNullable<typeof product> => product != null,
    )

    const links: LinkDefinition[] = products.map((product) => ({
      [Modules.PRODUCT]: { product_id: product.id },
      [VENDOR_MODULE]: { vendor_id: input.id },
    }))

    if (links.length) {
      await link.dismiss(links)
    }
    if (userIds.length) {
      await vendorModuleService.softDeleteVendorUsers(userIds)
    }
    if (connectionIds.length) {
      await vendorModuleService.softDeleteVendorIntegrationConnections(connectionIds)
    }

    await vendorModuleService.softDeleteVendors(input.id)

    return new StepResponse({ id: input.id }, {
      id: input.id,
      userIds,
      connectionIds,
      links,
    } satisfies DeleteVendorCompensation)
  },
  async (compensation: DeleteVendorCompensation | undefined, { container }) => {
    if (!compensation) {
      return
    }

    const vendorModuleService: VendorModuleService =
      container.resolve(VENDOR_MODULE)
    const link = container.resolve(ContainerRegistrationKeys.LINK)

    await vendorModuleService.restoreVendors(compensation.id)
    if (compensation.userIds.length) {
      await vendorModuleService.restoreVendorUsers(compensation.userIds)
    }
    if (compensation.connectionIds.length) {
      await vendorModuleService.restoreVendorIntegrationConnections(
        compensation.connectionIds,
      )
    }
    if (compensation.links.length) {
      await link.create(compensation.links)
    }
  },
)
