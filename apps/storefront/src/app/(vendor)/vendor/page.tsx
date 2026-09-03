"use client"

import { DataState } from "@/components/display/data-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VendorSection } from "@/vendor/components/section"
import { useGetVendorsOrders } from "@/vendor/hooks/queries/orders"
import { useGetVendorsProducts } from "@/vendor/hooks/queries/products"
import { useGetVendorsStockLocations } from "@/vendor/hooks/queries/stock-locations"

function StatCard({
  title,
  value,
  isLoading,
}: {
  title: string
  value: number | undefined
  isLoading: boolean
}) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <DataState isLoading={isLoading}>
          <DataState.Loading />
          <DataState.Content>
            <p className="text-2xl font-semibold">{value}</p>
          </DataState.Content>
        </DataState>
      </CardContent>
    </Card>
  )
}

export default function VendorDashboardPage() {
  const getVendorsProducts = useGetVendorsProducts()
  const getVendorsOrders = useGetVendorsOrders()
  const getVendorsStockLocations = useGetVendorsStockLocations()

  return (
    <VendorSection
      title="Dashboard"
      description="This is your vendor dashboard. See your profile and orders in the navigation above."
      className="gap-4 flex"
    >
      <StatCard
        title="Products"
        value={getVendorsProducts.data?.count}
        isLoading={getVendorsProducts.isLoading}
      />
      <StatCard
        title="Orders"
        value={getVendorsOrders.data?.count}
        isLoading={getVendorsOrders.isLoading}
      />
      <StatCard
        title="Locations"
        value={getVendorsStockLocations.data?.count}
        isLoading={getVendorsStockLocations.isLoading}
      />
    </VendorSection>
  )
}
