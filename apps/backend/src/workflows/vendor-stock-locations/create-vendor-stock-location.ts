import type { PostVendorsStockLocationsResponse } from "@dtc/api-contracts/vendor/stock-locations"
import type { StockLocationAddressInput } from "@medusajs/framework/types"
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createRemoteLinkStep,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { first } from "../shared/lib/first"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { buildFreeShippingOptionInput } from "./mappers/build-free-shipping-option-input"
import { buildFulfillmentLinkDefs } from "./mappers/build-fulfillment-link-defs"
import { buildStockLocation } from "./mappers/build-stock-location"
import { buildVendorLinkDefs } from "./mappers/build-vendor-link-defs"
import { createFreeShippingFulfillmentSetStep } from "./steps/create-free-shipping-fulfillment-set"
import { resolveSharedSalesChannelStep } from "./steps/resolve-shared-sales-channel"
import { resolveVendorShippingProfileStep } from "./steps/resolve-vendor-shipping-profile"

export type CreateVendorStockLocationWorkflowInput = {
  actorId: string
  name: string
  address: StockLocationAddressInput
}

export const createVendorStockLocationWorkflow = createWorkflow(
  "create-vendor-stock-location",
  function (input: CreateVendorStockLocationWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    const resolveSharedSalesChannel = resolveSharedSalesChannelStep()

    const createStockLocations = createStockLocationsWorkflow.runAsStep({
      input: {
        locations: [{ name: input.name, address: input.address }],
      },
    })

    const stockLocation = transform({ createStockLocations }, (data) =>
      first(data.createStockLocations),
    )

    linkSalesChannelsToStockLocationWorkflow.runAsStep({
      input: {
        id: stockLocation.id,
        add: [resolveSharedSalesChannel],
      },
    })

    const vendorLinkDefs = transform(
      { stockLocation, resolveVendorUser },
      (data) =>
        buildVendorLinkDefs({
          stockLocationId: data.stockLocation.id,
          vendorId: data.resolveVendorUser.vendorId,
        }),
    )

    createRemoteLinkStep(vendorLinkDefs).config({ name: "link-vendor" })

    // Every vendor location gets its own free shipping automatically — no
    // staff step, no Admin visit.
    const resolveVendorShippingProfile = resolveVendorShippingProfileStep({
      vendorId: resolveVendorUser.vendorId,
    })

    const createFreeShippingFulfillmentSet =
      createFreeShippingFulfillmentSetStep({
        stockLocationId: stockLocation.id,
      })

    // The provider and fulfillment-set links must exist *before* a shipping
    // option is created for this service zone
    const fulfillmentLinkDefs = transform(
      { stockLocation, createFreeShippingFulfillmentSet },
      (data) =>
        buildFulfillmentLinkDefs({
          stockLocationId: data.stockLocation.id,
          fulfillmentSetId:
            data.createFreeShippingFulfillmentSet.fulfillmentSetId,
        }),
    )

    createRemoteLinkStep(fulfillmentLinkDefs).config({
      name: "link-fulfillment",
    })

    const shippingOptionsInput = transform(
      { createFreeShippingFulfillmentSet, resolveVendorShippingProfile },
      (data) =>
        buildFreeShippingOptionInput({
          serviceZoneId: data.createFreeShippingFulfillmentSet.serviceZoneId,
          shippingProfileId:
            data.resolveVendorShippingProfile.shippingProfileId,
        }),
    )

    createShippingOptionsWorkflow.runAsStep({ input: shippingOptionsInput })

    const response = transform(
      { stockLocation },
      (data): PostVendorsStockLocationsResponse => ({
        stock_location: buildStockLocation(data.stockLocation),
      }),
    )

    return new WorkflowResponse(response)
  },
)
