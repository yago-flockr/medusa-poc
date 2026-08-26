"use client"

import { useFindManyVendorOrders } from "@/vendor/hooks/queries/orders"
import type { VendorOrder } from "@dtc/api-contracts/vendor/orders"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function VendorOrdersPage() {
  const findManyVendorOrders = useFindManyVendorOrders()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {findManyVendorOrders.isLoading && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}
        {!findManyVendorOrders.isLoading &&
          findManyVendorOrders.data?.orders.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
        {findManyVendorOrders.data?.orders.map((order: VendorOrder) => (
          <div
            key={order.id}
            className="flex items-center justify-between border rounded-md px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">Order #{order.display_id}</p>
              <p className="text-muted-foreground">{order.status}</p>
            </div>
            <p className="font-medium">
              {(order.total / 100).toFixed(2)}{" "}
              {order.currency_code.toUpperCase()}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
