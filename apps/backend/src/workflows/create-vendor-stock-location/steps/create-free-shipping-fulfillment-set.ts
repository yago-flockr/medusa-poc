import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ModuleRegistrationName } from "@medusajs/framework/utils"
import { deleteFulfillmentSetsWorkflow } from "@medusajs/medusa/core-flows"
import { ALL_MARKET_COUNTRY_CODES, countryGeoZones } from "../../../lib/markets"

export type CreateFreeShippingFulfillmentSetStepInput = {
  stockLocationId: string
}

export const createFreeShippingFulfillmentSetStep = createStep(
  "create-free-shipping-fulfillment-set",
  async (input: CreateFreeShippingFulfillmentSetStepInput, { container }) => {
    const fulfillmentModuleService = container.resolve(ModuleRegistrationName.FULFILLMENT)

    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: `Vendor location ${input.stockLocationId} — free shipping`,
      type: "shipping",
      service_zones: [
        {
          name: "All markets",
          geo_zones: countryGeoZones(ALL_MARKET_COUNTRY_CODES),
        },
      ],
    })

    return new StepResponse(
      {
        fulfillmentSetId: fulfillmentSet.id,
        serviceZoneId: fulfillmentSet.service_zones[0].id,
      },
      fulfillmentSet.id,
    )
  },
  async (fulfillmentSetId, { container }) => {
    if (!fulfillmentSetId) {
      return
    }

    await deleteFulfillmentSetsWorkflow(container).run({
      input: { ids: [fulfillmentSetId] },
    })
  },
)
