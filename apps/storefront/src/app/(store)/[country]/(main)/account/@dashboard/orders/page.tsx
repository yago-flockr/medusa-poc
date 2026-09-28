import { Metadata } from "next"

import { listOrders } from "@/store/lib/data/orders"
import OrderOverview from "@/store/modules/account/components/order-overview"
import TransferRequestForm from "@/store/modules/account/components/transfer-request-form"
import { Separator } from "@/components/ui/separator"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div
      className="flex w-full flex-col gap-8"
      data-testid="orders-page-wrapper"
    >
      <div className="flex flex-col gap-y-4">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm">
          View your previous orders and their status. You can also create
          returns or exchanges for your orders if needed.
        </p>
      </div>
      <OrderOverview orders={orders} />
      <Separator />
      <TransferRequestForm />
    </div>
  )
}
