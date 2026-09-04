import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  createRemoteLinkStep,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import type { LinkDefinition, StockLocationAddressInput } from "@medusajs/framework/types"
import { VENDOR_MODULE } from "../../modules/vendor"
import { STORE_SUPPORTED_CURRENCIES } from "../../lib/markets"
import { resolveSharedSalesChannelStep } from "./steps/resolve-shared-sales-channel"
import { createFreeShippingFulfillmentSetStep } from "./steps/create-free-shipping-fulfillment-set"

export type CreateVendorStockLocationWorkflowInput = {
  vendorId: string
  name: string
  address: StockLocationAddressInput
}

export const createVendorStockLocationWorkflow = createWorkflow(
  "create-vendor-stock-location",
  function (input: CreateVendorStockLocationWorkflowInput) {
    const salesChannelId = resolveSharedSalesChannelStep()

    const stockLocations = createStockLocationsWorkflow.runAsStep({
      input: {
        locations: [{ name: input.name, address: input.address }],
      },
    })

    const stockLocation = transform({ stockLocations }, (data) => data.stockLocations[0])

    linkSalesChannelsToStockLocationWorkflow.runAsStep({
      input: {
        id: stockLocation.id,
        add: [salesChannelId],
      },
    })

    const vendorLinkDefs = transform(
      { stockLocation, vendorId: input.vendorId },
      (data): LinkDefinition[] => [
        {
          [Modules.STOCK_LOCATION]: { stock_location_id: data.stockLocation.id },
          [VENDOR_MODULE]: { vendor_id: data.vendorId },
        },
      ],
    )

    createRemoteLinkStep(vendorLinkDefs).config({ name: "link-vendor" })

    // Every vendor location gets its own free shipping automatically — no
    // staff step, no Admin visit. The vendor arranges and pays for delivery
    // themselves (docs/features/multi-vendor-marketplace.md, "Fulfilling"),
    // so this is a placeholder to satisfy Medusa's "a shipping method must
    // exist to complete checkout" rule, not a real shipping cost.
    const { data: shippingProfiles } = useQueryGraphStep({
      entity: "shipping_profile",
      fields: ["id"],
    }).config({ name: "retrieve-shipping-profile" })

    const fulfillmentSet = createFreeShippingFulfillmentSetStep({
      stockLocationId: stockLocation.id,
    })

    // The provider and fulfillment-set links must exist *before* a shipping
    // option is created for this service zone — Medusa validates the
    // service zone's location has that provider enabled, and creating the
    // shipping option first throws "Providers (manual_manual) are not
    // enabled for the service location."
    const fulfillmentLinkDefs = transform(
      { stockLocation, fulfillmentSet },
      (data): LinkDefinition[] => [
        {
          [Modules.STOCK_LOCATION]: { stock_location_id: data.stockLocation.id },
          [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
        },
        {
          [Modules.STOCK_LOCATION]: { stock_location_id: data.stockLocation.id },
          [Modules.FULFILLMENT]: { fulfillment_set_id: data.fulfillmentSet.fulfillmentSetId },
        },
      ],
    )

    createRemoteLinkStep(fulfillmentLinkDefs).config({ name: "link-fulfillment" })

    const shippingOptionsInput = transform(
      { fulfillmentSet, shippingProfiles },
      (data) => [
        {
          name: "Free Shipping",
          price_type: "flat" as const,
          provider_id: "manual_manual",
          service_zone_id: data.fulfillmentSet.serviceZoneId,
          shipping_profile_id: data.shippingProfiles[0].id,
          type: {
            label: "Free Shipping",
            description: "The vendor arranges and pays for delivery themselves.",
            code: "free",
          },
          prices: STORE_SUPPORTED_CURRENCIES.map((currency) => ({
            currency_code: currency.currency_code,
            amount: 0,
          })),
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
            { attribute: "is_return", value: "false", operator: "eq" as const },
          ],
        },
      ],
    )

    createShippingOptionsWorkflow.runAsStep({ input: shippingOptionsInput })

    return new WorkflowResponse(stockLocation)
  },
)

export default createVendorStockLocationWorkflow
