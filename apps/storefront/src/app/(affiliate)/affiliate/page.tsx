"use client"

import { Section } from "@/components/display/section"
import { StatCard } from "@/components/display/stat-card"
import { useGetAffiliatesMe } from "@/affiliate/hooks/queries/me"
import { useGetAffiliatesSales } from "@/affiliate/hooks/queries/sales"

export default function AffiliateSalesPage() {
  const getAffiliatesMe = useGetAffiliatesMe()
  const getAffiliatesSales = useGetAffiliatesSales()

  const totals = getAffiliatesSales.data?.totals

  return (
    <Section
      title="Dashboard"
      description={
        getAffiliatesMe.data
          ? `Everything bought through your code "${getAffiliatesMe.data.affiliate.handle}".`
          : "Everything bought through your code."
      }
      className="flex flex-col gap-4 sm:flex-row"
    >
      <StatCard
        className="flex-1"
        title="Orders"
        value={totals?.orders ?? 0}
        isLoading={getAffiliatesSales.isLoading}
      />
      <StatCard
        className="flex-1"
        title="Units sold"
        value={totals?.units_sold ?? 0}
        isLoading={getAffiliatesSales.isLoading}
      />
      <StatCard
        className="flex-1"
        title="Revenue"
        value={(totals?.revenue ?? 0).toFixed(2)}
        isLoading={getAffiliatesSales.isLoading}
      />
      <StatCard
        className="flex-1"
        title="You earned"
        value={(totals?.commission_total ?? 0).toFixed(2)}
        isLoading={getAffiliatesSales.isLoading}
      />
    </Section>
  )
}
