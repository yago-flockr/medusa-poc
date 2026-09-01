import { createWorkflow, transform, WorkflowResponse, when } from "@medusajs/framework/workflows-sdk"
import {
  attachInventoryItemToVariants,
  batchInventoryItemLevelsWorkflow,
  createInventoryItemsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"
import { resolveInventoryStateStep } from "./steps/resolve-inventory-state"

export type SetVendorInventoryLevelWorkflowInput = {
  variantId: string
  locationId: string
  quantity: number
}

export const setVendorInventoryLevelWorkflow = createWorkflow(
  "set-vendor-inventory-level",
  function (input: SetVendorInventoryLevelWorkflowInput) {
    const { inventoryItemId, existingLevelId } = resolveInventoryStateStep({
      variantId: input.variantId,
      locationId: input.locationId,
    })

    when(
      "create-item-with-level",
      { inventoryItemId },
      (data) => !data.inventoryItemId,
    ).then(() => {
      const items = createInventoryItemsWorkflow.runAsStep({
        input: {
          items: [
            {
              location_levels: [
                { location_id: input.locationId, stocked_quantity: input.quantity },
              ],
            },
          ],
        },
      })

      const attachInput = transform(
        { items, variantId: input.variantId },
        (data) => [{ inventoryItemId: data.items[0].id, tag: data.variantId }],
      )

      attachInventoryItemToVariants(attachInput)

      updateProductVariantsWorkflow.runAsStep({
        input: {
          product_variants: [{ id: input.variantId, manage_inventory: true }],
        },
      })
    })

    const batchLevelsInput = transform(
      {
        inventoryItemId,
        existingLevelId,
        locationId: input.locationId,
        quantity: input.quantity,
      },
      (data) => {
        if (!data.inventoryItemId) {
          return { create: [], update: [] }
        }

        const level = {
          inventory_item_id: data.inventoryItemId,
          location_id: data.locationId,
          stocked_quantity: data.quantity,
        }

        return data.existingLevelId
          ? { create: [], update: [level] }
          : { create: [level], update: [] }
      },
    )

    when(
      "set-level-for-existing-item",
      { inventoryItemId },
      (data) => Boolean(data.inventoryItemId),
    ).then(() => {
      batchInventoryItemLevelsWorkflow.runAsStep({ input: batchLevelsInput })
    })

    return new WorkflowResponse(undefined)
  },
)

export default setVendorInventoryLevelWorkflow
