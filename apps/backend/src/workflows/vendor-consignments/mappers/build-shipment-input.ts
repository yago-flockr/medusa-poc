export type BuildShipmentInputParams = {
  orderId: string
  fulfillmentId: string
  items: { id: string; quantity: number }[]
  trackingNumber: string
  trackingUrl?: string
}

export function buildShipmentInput({
  orderId,
  fulfillmentId,
  items,
  trackingNumber,
  trackingUrl,
}: BuildShipmentInputParams) {
  return {
    order_id: orderId,
    fulfillment_id: fulfillmentId,
    items,
    labels: [
      {
        tracking_number: trackingNumber,
        tracking_url: trackingUrl ?? "",
        label_url: "",
      },
    ],
  }
}
