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
  shippingProfileLink: LinkDefinition | null
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
      fields: [
        "id",
        "users.id",
        "integration_connections.id",
        "products.id",
        "shipping_profile.id",
      ],
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

    // Fulfillment has no restore method for shipping profiles, so only the
    // link is dismissed here — the row itself is left as a harmless orphan.
    const shippingProfileLink: LinkDefinition | null = vendor?.shipping_profile
      ?.id
      ? {
          [VENDOR_MODULE]: { vendor_id: input.id },
          [Modules.FULFILLMENT]: {
            shipping_profile_id: vendor.shipping_profile.id,
          },
        }
      : null

    if (links.length) {
      await link.dismiss(links)
    }
    if (shippingProfileLink) {
      await link.dismiss([shippingProfileLink])
    }
    if (userIds.length) {
      await vendorModuleService.softDeleteVendorUsers(userIds)
    }
    if (connectionIds.length) {
      await vendorModuleService.softDeleteVendorIntegrationConnections(
        connectionIds,
      )
    }

    await vendorModuleService.softDeleteVendors(input.id)

    return new StepResponse({ id: input.id }, {
      id: input.id,
      userIds,
      connectionIds,
      links,
      shippingProfileLink,
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
    if (compensation.shippingProfileLink) {
      await link.create([compensation.shippingProfileLink])
    }
  },
)
