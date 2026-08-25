"use client"

import {
  useFindManyVendorOrders,
  type VendorOrder,
} from "@/vendor/hooks/queries/orders"
import { VendorNav } from "@/vendor/components/nav"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function VendorOrdersPage() {
  const { data, isLoading } = useFindManyVendorOrders()

  return (
    <div>
      <VendorNav />
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
          {!isLoading && data?.orders.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
          {data?.orders.map((order: VendorOrder) => (
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
    </div>
  )
}
