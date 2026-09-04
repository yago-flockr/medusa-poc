"use client"

import { ConfirmDeleteDialog } from "@/components/display/confirm-delete-dialog"
import { DataState } from "@/components/display/data-state"
import { FormDialog } from "@/components/display/form-dialog"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { VendorSection } from "@/vendor/components/section"
import type { CommonFormValuesProps } from "@/vendor/forms/form-type"
import {
  StockLocationForm,
  stockLocationFormToInput,
  stockLocationInputToForm,
  type StockLocationSchema,
} from "@/vendor/forms/stock-location-form"
import {
  useDeleteVendorsStockLocationsById,
  usePostVendorsStockLocations,
  usePostVendorsStockLocationsById,
} from "@/vendor/hooks/mutations/stock-locations"
import { useListRegions } from "@/vendor/hooks/queries/regions"
import { useGetVendorsStockLocations } from "@/vendor/hooks/queries/stock-locations"
import type { VendorStockLocation } from "@dtc/api-contracts/vendor/stock-locations"
import { RiDeleteBinLine, RiPencilLine } from "@remixicon/react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

type LocationFormValues = CommonFormValuesProps<
  StockLocationSchema,
  VendorStockLocation
>

export default function VendorLocationsPage() {
  const getVendorsStockLocations = useGetVendorsStockLocations()
  const postVendorsStockLocations = usePostVendorsStockLocations()
  const postVendorsStockLocationsById = usePostVendorsStockLocationsById()
  const deleteVendorsStockLocationsById = useDeleteVendorsStockLocationsById()
  const listRegions = useListRegions()

  const countryOptions = useMemo(() => {
    const countries = (listRegions.data ?? []).flatMap(
      (region) => region.countries ?? [],
    )

    const seen = new Set<string>()
    return countries
      .filter((country): country is typeof country & { iso_2: string } =>
        Boolean(country.iso_2),
      )
      .filter((country) => {
        if (seen.has(country.iso_2)) return false
        seen.add(country.iso_2)
        return true
      })
      .map((country) => ({
        value: country.iso_2,
        label: country.display_name ?? country.iso_2.toUpperCase(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [listRegions.data])

  const [formValues, setFormValues] = useState<LocationFormValues>()

  function handleSubmit(values: StockLocationSchema) {
    if (formValues?.state === "UPDATING") {
      postVendorsStockLocationsById.mutate(
        {
          id: formValues.customValues!.id!,
          ...stockLocationFormToInput(values),
        },
        {
          onSuccess: () => {
            toast.success("Location updated")
            getVendorsStockLocations.refetch()
            setFormValues(undefined)
          },
        },
      )
      return
    }

    if (formValues?.state === "CREATING") {
      postVendorsStockLocations.mutate(stockLocationFormToInput(values), {
        onSuccess: () => {
          toast.success("Location created")
          getVendorsStockLocations.refetch()
          setFormValues(undefined)
        },
      })
    }
  }

  return (
    <VendorSection
      title="Locations"
      description="Where your stock is held. Link a product's variants to a location and quantity from the Products page."
      action={
        <Button size="sm" onClick={() => setFormValues({ state: "CREATING" })}>
          Create
        </Button>
      }
      className="flex flex-col gap-3"
    >
      <DataState
        isLoading={getVendorsStockLocations.isLoading}
        isEmpty={getVendorsStockLocations.data?.stock_locations.length === 0}
      >
        <DataState.Loading />
        <DataState.Empty>
          <p className="text-sm text-muted-foreground">No locations yet.</p>
        </DataState.Empty>
        <DataState.Content>
          <ItemGroup>
            {getVendorsStockLocations.data?.stock_locations.map(
              (location: VendorStockLocation) => (
                <Item key={location.id} variant="outline">
                  <ItemContent>
                    <ItemTitle>{location.name}</ItemTitle>
                    {location.address && (
                      <ItemDescription>
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
                      </ItemDescription>
                    )}
                  </ItemContent>
                  <ItemActions>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() =>
                        setFormValues({
                          state: "UPDATING",
                          defaultValues: stockLocationInputToForm(location),
                          customValues: location,
                        })
                      }
                    >
                      <RiPencilLine />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      onClick={() =>
                        setFormValues({
                          state: "DELETING",
                          customValues: location,
                        })
                      }
                    >
                      <RiDeleteBinLine />
                    </Button>
                  </ItemActions>
                </Item>
              ),
            )}
          </ItemGroup>
        </DataState.Content>
      </DataState>
      <FormDialog
        title="Manage stock location"
        description="This is where your stock is held."
        open={
          formValues?.state === "CREATING" || formValues?.state === "UPDATING"
        }
        onOpenChange={(open) => {
          if (!open) setFormValues(undefined)
        }}
      >
        <StockLocationForm
          defaultValues={formValues?.defaultValues}
          onSubmit={handleSubmit}
          countryOptions={countryOptions}
          isLoading={
            postVendorsStockLocations.isPending ||
            postVendorsStockLocationsById.isPending
          }
        />
      </FormDialog>
      <ConfirmDeleteDialog
        title="Delete this location?"
        description="Are you sure you want to delete this location? This action cannot be undone."
        open={formValues?.state === "DELETING"}
        onOpenChange={(open) => !open && setFormValues(undefined)}
        isLoading={deleteVendorsStockLocationsById.isPending}
        onConfirm={() => {
          if (formValues?.state !== "DELETING") return

          deleteVendorsStockLocationsById.mutate(formValues.customValues!.id!, {
            onSuccess: () => {
              toast.success("Location deleted")
              getVendorsStockLocations.refetch()
              setFormValues(undefined)
            },
          })
        }}
      />
    </VendorSection>
  )
}
