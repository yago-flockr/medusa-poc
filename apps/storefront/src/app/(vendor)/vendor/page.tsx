"use client"

import { useFindOneVendor } from "@/vendor/hooks/queries/vendor"
import { VendorSection } from "@/vendor/components/section"
import { DataState } from "@/components/display/data-state"

export default function VendorDashboardPage() {
  const findOneVendor = useFindOneVendor()

  return (
    <VendorSection
      title="Dashboard"
      description="This is your vendor dashboard. See your profile and orders in the navigation above."
    >
      <DataState isLoading={findOneVendor.isLoading}>
        <DataState.Loading />
        <DataState.Content>
          <p className="text-sm font-medium">
            Welcome, {findOneVendor.data?.vendor.name}
          </p>
        </DataState.Content>
      </DataState>
    </VendorSection>
  )
}
