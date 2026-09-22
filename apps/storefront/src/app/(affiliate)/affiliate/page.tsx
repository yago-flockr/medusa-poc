"use client"

import { Section } from "@/components/display/section"
import { useGetAffiliatesMe } from "@/affiliate/hooks/queries/me"
import { useGetAffiliatesSales } from "@/affiliate/hooks/queries/sales"
import { DataState } from "@/components/display/data-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AffiliateSalesPage() {
  const getAffiliatesMe = useGetAffiliatesMe()
  const getAffiliatesSales = useGetAffiliatesSales()

  const productSales = getAffiliatesSales.data?.product_sales ?? []

  return (
    <Section
      title="Sales"
      description={
        getAffiliatesMe.data
          ? `Everything bought through your code "${getAffiliatesMe.data.affiliate.handle}", best seller first.`
          : "Everything bought through your code, best seller first."
      }
    >
      <DataState
        isLoading={getAffiliatesSales.isLoading}
        isEmpty={productSales.length === 0}
      >
        <DataState.Loading />
        <DataState.Empty>
          Nothing has sold through your code yet.
        </DataState.Empty>
        <DataState.Content>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Units sold</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productSales.map((sales) => (
                <TableRow key={sales.product_id}>
                  <TableCell>{sales.product_title}</TableCell>
                  <TableCell className="text-right">
                    {sales.units_sold}
                  </TableCell>
                  <TableCell className="text-right">{sales.orders}</TableCell>
                  <TableCell className="text-right">{sales.revenue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState.Content>
      </DataState>
    </Section>
  )
}
