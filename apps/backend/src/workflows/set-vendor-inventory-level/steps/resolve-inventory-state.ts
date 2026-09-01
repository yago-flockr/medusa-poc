import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export type ResolveInventoryStateStepInput = {
  variantId: string
  locationId: string
}

export type ResolveInventoryStateStepOutput = {
  inventoryItemId: string | null
  existingLevelId: string | null
}

export const resolveInventoryStateStep = createStep(
  "resolve-inventory-state",
  async (
    { variantId, locationId }: ResolveInventoryStateStepInput,
    { container },
  ): Promise<StepResponse<ResolveInventoryStateStepOutput>> => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [variant],
    } = await query.graph({
      entity: "variant",
      fields: ["id", "inventory_items.inventory.id"],
      filters: { id: variantId },
    })

    const inventoryItemId =
      variant?.inventory_items?.[0]?.inventory?.id ?? null

    if (!inventoryItemId) {
      return new StepResponse({ inventoryItemId: null, existingLevelId: null })
    }

    const { data: levels } = await query.graph({
      entity: "inventory_level",
      fields: ["id"],
      filters: { inventory_item_id: inventoryItemId, location_id: locationId },
    })

    return new StepResponse({
      inventoryItemId,
      existingLevelId: levels[0]?.id ?? null,
    })
  },
)
