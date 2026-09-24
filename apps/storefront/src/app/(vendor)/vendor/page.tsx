"use client"

import { Section } from "@/components/display/section"
import { StatCard } from "@/components/display/stat-card"
import { useGetVendorsOrders } from "@/vendor/hooks/queries/orders"
import { useGetVendorsProducts } from "@/vendor/hooks/queries/products"
import { useGetVendorsStockLocations } from "@/vendor/hooks/queries/stock-locations"

export default function VendorDashboardPage() {
  const getVendorsProducts = useGetVendorsProducts()
  const getVendorsOrders = useGetVendorsOrders()
  const getVendorsStockLocations = useGetVendorsStockLocations()

  const currencyCode =
    getVendorsOrders.data?.orders[0]?.currency_code.toUpperCase() ?? ""
  const money = (amount: number | undefined) =>
    amount === undefined ? "—" : `${amount.toFixed(2)} ${currencyCode}`

  return (
    <Section
      title="Dashboard"
      description="This is your vendor dashboard. See your profile and orders in the navigation above."
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <StatCard
          className="flex-1"
          title="Sold"
          value={money(getVendorsOrders.data?.earnings_totals.subtotal)}
          isLoading={getVendorsOrders.isLoading}
        />
        <StatCard
          className="flex-1"
          title="Commission"
          value={money(getVendorsOrders.data?.earnings_totals.commission_total)}
          isLoading={getVendorsOrders.isLoading}
        />
        <StatCard
          className="flex-1"
          title="Your earnings"
          value={money(getVendorsOrders.data?.earnings_totals.earning_total)}
          isLoading={getVendorsOrders.isLoading}
        />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <StatCard
          className="flex-1"
          title="Products"
          value={getVendorsProducts.data?.count}
          isLoading={getVendorsProducts.isLoading}
        />
        <StatCard
          className="flex-1"
          title="Orders"
          value={getVendorsOrders.data?.count}
          isLoading={getVendorsOrders.isLoading}
        />
        <StatCard
          className="flex-1"
          title="Locations"
          value={getVendorsStockLocations.data?.count}
          isLoading={getVendorsStockLocations.isLoading}
        />
      </div>
    </Section>
  )
}
