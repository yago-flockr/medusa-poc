import { HttpTypes } from "@medusajs/types"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div className="text-sm">
      <p>
        We have sent the order confirmation details to{" "}
        <span className="font-semibold" data-testid="order-email">
          {order.email}
        </span>
        .
      </p>
      <p className="mt-2">
        Order date:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toDateString()}
        </span>
      </p>
      <p className="mt-2 text-primary">
        Order number: <span data-testid="order-id">{order.display_id}</span>
      </p>

      <div className="mt-4 flex items-center gap-x-4 text-sm">
        {showStatus && (
          <>
            <p>
              Order status:{" "}
              <span
                className="text-muted-foreground"
                data-testid="order-status"
              >
                {formatStatus(order.fulfillment_status)}
              </span>
            </p>
            <p>
              Payment status:{" "}
              <span
                className="text-muted-foreground"
                data-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
