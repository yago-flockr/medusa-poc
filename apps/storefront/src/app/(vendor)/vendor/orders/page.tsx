"use client"

import { useGetOrders } from "@/vendor/hooks/queries/orders"
import type { VendorOrder } from "@dtc/api-contracts/vendor/orders"
import { VendorSection } from "@/vendor/components/section"
import { DataState } from "@/components/display/data-state"

export default function VendorOrdersPage() {
  const getOrders = useGetOrders()

  return (
    <VendorSection
      title="Orders"
      description="Manage your orders"
      className="flex flex-col gap-3"
    >
      <DataState
        isLoading={getOrders.isLoading}
        isEmpty={getOrders.data?.orders.length === 0}
      >
        <DataState.Loading />
        <DataState.Empty>
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        </DataState.Empty>
        <DataState.Content>
          {getOrders.data?.orders.map((order: VendorOrder) => (
            <div
              key={order.id}
              className="flex items-center justify-between border rounded-md px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">Order #{order.display_id}</p>
                <p className="text-muted-foreground">{order.status}</p>
              </div>
              <p className="font-medium">
                {order.total.toFixed(2)} {order.currency_code.toUpperCase()}
              </p>
            </div>
          ))}
        </DataState.Content>
      </DataState>
    </VendorSection>
  )
}
