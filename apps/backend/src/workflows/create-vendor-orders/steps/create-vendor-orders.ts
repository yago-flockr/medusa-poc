import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  cancelOrderWorkflow,
  createOrderWorkflow,
} from "@medusajs/medusa/core-flows"
import { Modules, promiseAll } from "@medusajs/framework/utils"
import type {
  CartLineItemDTO,
  LinkDefinition,
  OrderDTO,
} from "@medusajs/framework/types"
import { VENDOR_MODULE } from "../../../modules/vendor"

type VendorOrder = OrderDTO & { vendor_id: string }

export type CreateVendorOrdersStepInput = {
  parentOrder: OrderDTO
  vendorsItems: Record<string, CartLineItemDTO[]>
}

function buildVendorOrderLink(orderId: string, vendorId: string): LinkDefinition {
  return {
    [Modules.ORDER]: { order_id: orderId },
    [VENDOR_MODULE]: { vendor_id: vendorId },
  }
}

function prepareOrderData(items: CartLineItemDTO[], parentOrder: OrderDTO) {
  return {
    items,
    metadata: { parent_order_id: parentOrder.id },
    region_id: parentOrder.region_id,
    customer_id: parentOrder.customer_id,
    sales_channel_id: parentOrder.sales_channel_id,
    email: parentOrder.email,
    currency_code: parentOrder.currency_code,
    shipping_address_id: parentOrder.shipping_address?.id,
    billing_address_id: parentOrder.billing_address?.id,
    shipping_methods: parentOrder.shipping_methods?.map((shippingMethod) => ({
      name: shippingMethod.name,
      amount: shippingMethod.amount,
      shipping_option_id: shippingMethod.shipping_option_id,
      data: shippingMethod.data,
    })),
  }
}

export const createVendorOrdersStep = createStep(
  "create-vendor-orders",
  async (
    { vendorsItems, parentOrder }: CreateVendorOrdersStepInput,
    { container },
  ) => {
    const linkDefs: LinkDefinition[] = []
    const createdOrders: VendorOrder[] = []
    const vendorIds = Object.keys(vendorsItems)

    if (vendorIds.length === 1) {
      const [vendorId] = vendorIds

      linkDefs.push(buildVendorOrderLink(parentOrder.id, vendorId))

      return new StepResponse(
        {
          orders: [{ ...parentOrder, vendor_id: vendorId }],
          linkDefs,
        },
        { created_order_ids: [] },
      )
    }

    try {
      await promiseAll(
        vendorIds.map(async (vendorId) => {
          const items = vendorsItems[vendorId]

          const { result: childOrder } = await createOrderWorkflow(
            container,
          ).run({
            input: prepareOrderData(items, parentOrder),
          })

          createdOrders.push({ ...childOrder, vendor_id: vendorId })
          linkDefs.push(buildVendorOrderLink(childOrder.id, vendorId))
        }),
      )
    } catch (error) {
      return StepResponse.permanentFailure(
        `An error occurred while creating vendor orders: ${error}`,
        { created_order_ids: createdOrders.map((order) => order.id) },
      )
    }

    return new StepResponse(
      { orders: createdOrders, linkDefs },
      { created_order_ids: createdOrders.map((order) => order.id) },
    )
  },
  async (compensation, { container }) => {
    if (!compensation?.created_order_ids?.length) {
      return
    }

    await promiseAll(
      compensation.created_order_ids.map((orderId) =>
        cancelOrderWorkflow(container).run({ input: { order_id: orderId } }),
      ),
    )
  },
)
