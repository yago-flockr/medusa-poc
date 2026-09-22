import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { graph } from "../../../lib/query"
export type ResolveVariantInventoryItemsStepInput = {
  variantSkus: { id: string; sku: string }[]
}

// updateProductVariantsWorkflow never touches the linked InventoryItem's
// sku — resolve it here so it can be synced separately.
export const resolveVariantInventoryItemsStep = createStep(
  "resolve-variant-inventory-items",
  async (
    { variantSkus }: ResolveVariantInventoryItemsStepInput,
    { container },
  ) => {
    if (!variantSkus.length) {
      return new StepResponse([])
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: variantsWithInventory } = await graph(query, {
      entity: "product_variant",
      fields: ["id", "inventory_items.inventory.id"],
      filters: { id: variantSkus.map((variant) => variant.id) },
    })

    return new StepResponse(
      variantsWithInventory.flatMap((variant) => {
        const matchingInput = variantSkus.find((v) => v.id === variant.id)
        const inventoryItemId = variant.inventory_items?.[0]?.inventory?.id

        if (!matchingInput || !inventoryItemId) {
          return []
        }

        return [{ id: inventoryItemId, sku: matchingInput.sku }]
      }),
    )
  },
)
