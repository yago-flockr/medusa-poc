import {
  createWorkflow,
  transform,
  WorkflowResponse,
  when,
} from "@medusajs/framework/workflows-sdk"
import {
  attachInventoryItemToVariants,
  batchInventoryItemLevelsWorkflow,
  createInventoryItemsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"
import { resolveVendorUserStep } from "../vendors/shared/steps/resolve-vendor-user"
import { assertOwnedStockLocationStep } from "../vendors/shared/steps/assert-owned-stock-location"
import { resolveOwnedVendorProductStep } from "./steps/resolve-owned-vendor-product"
import { assertOwnedVendorVariantStep } from "./steps/assert-owned-vendor-variant"
import { resolveInventoryStateStep } from "./steps/resolve-inventory-state"
import { getVendorProductInventoryWorkflow } from "./get-vendor-product-inventory"

export type SetVendorInventoryLevelWorkflowInput = {
  actorId: string
  productId: string
  variantId: string
  locationId: string
  quantity: number
}

export const setVendorInventoryLevelWorkflow = createWorkflow(
  "set-vendor-inventory-level",
  function (input: SetVendorInventoryLevelWorkflowInput) {
    const resolveVendorUser = resolveVendorUserStep({ actorId: input.actorId })

    resolveOwnedVendorProductStep({
      productId: input.productId,
      vendorId: resolveVendorUser.vendorId,
    })
    assertOwnedVendorVariantStep({
      variantId: input.variantId,
      vendorId: resolveVendorUser.vendorId,
    })
    assertOwnedStockLocationStep({
      stockLocationId: input.locationId,
      vendorId: resolveVendorUser.vendorId,
    })

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
                {
                  location_id: input.locationId,
                  stocked_quantity: input.quantity,
                },
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

    when("set-level-for-existing-item", { inventoryItemId }, (data) =>
      Boolean(data.inventoryItemId),
    ).then(() => {
      batchInventoryItemLevelsWorkflow.runAsStep({ input: batchLevelsInput })
    })

    const response = getVendorProductInventoryWorkflow.runAsStep({
      input: { actorId: input.actorId, productId: input.productId },
    })

    return new WorkflowResponse(response)
  },
)
