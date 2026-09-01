"use client"

import { DataState } from "@/components/display/data-state"
import { VendorSection } from "@/vendor/components/section"
import { useGetStockLocations } from "@/vendor/hooks/queries/stock-locations"
import type { VendorStockLocation } from "@dtc/api-contracts/vendor/stock-locations"
import { CreateStockLocationDialog } from "./_components/create-stock-location-dialog"

export default function VendorLocationsPage() {
  const getStockLocations = useGetStockLocations()

  return (
    <VendorSection
      title="Locations"
      description="Where your stock is held. Link a product's variants to a location and quantity from the Products page."
      action={
        <CreateStockLocationDialog onCreated={() => getStockLocations.refetch()} />
      }
      className="flex flex-col gap-3"
    >
      <DataState
        isLoading={getStockLocations.isLoading}
        isEmpty={getStockLocations.data?.stock_locations.length === 0}
      >
        <DataState.Loading />
        <DataState.Empty>
          <p className="text-sm text-muted-foreground">No locations yet.</p>
        </DataState.Empty>
        <DataState.Content>
          <ul className="flex flex-col gap-2">
            {getStockLocations.data?.stock_locations.map(
              (location: VendorStockLocation) => (
                <li
                  key={location.id}
                  className="flex flex-col gap-1 rounded-md border px-4 py-3 text-sm"
                >
                  <p className="font-medium">{location.name}</p>
                  {location.address && (
                    <p className="text-xs text-muted-foreground">
                      {[
                        location.address.address_1,
                        location.address.address_2,
                        location.address.city,
                        location.address.province,
                        location.address.postal_code,
                        location.address.country_code.toUpperCase(),
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </li>
              ),
            )}
          </ul>
        </DataState.Content>
      </DataState>
    </VendorSection>
  )
}
