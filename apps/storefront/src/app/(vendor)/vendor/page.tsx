"use client"

import { useGetMe } from "@/vendor/hooks/queries/vendor"
import { VendorSection } from "@/vendor/components/section"
import { DataState } from "@/components/display/data-state"

export default function VendorDashboardPage() {
  const getMe = useGetMe()

  return (
    <VendorSection
      title="Dashboard"
      description="This is your vendor dashboard. See your profile and orders in the navigation above."
    >
      <DataState isLoading={getMe.isLoading}>
        <DataState.Loading />
        <DataState.Content>
          <p className="text-sm font-medium">
            Welcome, {getMe.data?.vendor.name}
          </p>
        </DataState.Content>
      </DataState>
    </VendorSection>
  )
}
