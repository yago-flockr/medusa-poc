"use client"

import { DataState } from "@/components/display/data-state"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSetProductInventory } from "@/vendor/hooks/mutations/product-inventory"
import { useGetProductInventory } from "@/vendor/hooks/queries/product-inventory"
import { RiStackLine } from "@remixicon/react"
import { useEffect, useState } from "react"

type ManageInventoryDialogProps = {
  productId: string
  productTitle: string
}

export function ManageInventoryDialog({
  productId,
  productTitle,
}: ManageInventoryDialogProps) {
  const [open, setOpen] = useState(false)
  const getProductInventory = useGetProductInventory(productId, {
    enabled: open,
  })
  const setProductInventory = useSetProductInventory()

  const handleCommit = (
    variantId: string,
    locationId: string,
    quantity: number,
  ) => {
    setProductInventory.mutate(
      { productId, variant_id: variantId, location_id: locationId, quantity },
      { onSuccess: () => getProductInventory.refetch() },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="icon">
            <RiStackLine size={16} />
          </Button>
        }
      />
      <DialogContent className="max-w-2xl gap-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage inventory — {productTitle}</DialogTitle>
        </DialogHeader>
        <DataState
          isLoading={getProductInventory.isLoading}
          isEmpty={getProductInventory.data?.locations.length === 0}
        >
          <DataState.Loading />
          <DataState.Empty>
            <p className="text-sm text-muted-foreground">
              You don&apos;t have any locations yet. Create one on the Locations
              page first.
            </p>
          </DataState.Empty>
          <DataState.Content>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  {getProductInventory.data?.locations.map((location) => (
                    <TableHead key={location.id}>{location.name}</TableHead>
                  ))}
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getProductInventory.data?.variants.map((variant) => (
                  <TableRow key={variant.variant_id}>
                    <TableCell>{variant.variant_title}</TableCell>
                    {getProductInventory.data?.locations.map((location) => {
                      const quantity =
                        variant.levels.find(
                          (level) => level.location_id === location.id,
                        )?.quantity ?? 0
                      const isSaving =
                        setProductInventory.isPending &&
                        setProductInventory.variables?.variant_id ===
                          variant.variant_id &&
                        setProductInventory.variables?.location_id ===
                          location.id

                      return (
                        <TableCell key={location.id}>
                          <InventoryCell
                            quantity={quantity}
                            isSaving={isSaving}
                            onCommit={(next) =>
                              handleCommit(
                                variant.variant_id,
                                location.id,
                                next,
                              )
                            }
                          />
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      {variant.levels.reduce(
                        (total, level) => total + level.quantity,
                        0,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {setProductInventory.isError && (
              <p className="mt-3 text-sm text-destructive">
                {setProductInventory.error.message}
              </p>
            )}
          </DataState.Content>
        </DataState>
      </DialogContent>
    </Dialog>
  )
}

type InventoryCellProps = {
  quantity: number
  isSaving: boolean
  onCommit: (quantity: number) => void
}

function InventoryCell({ quantity, isSaving, onCommit }: InventoryCellProps) {
  const [value, setValue] = useState(quantity)

  useEffect(() => {
    setValue(quantity)
  }, [quantity])

  return (
    <NumberField
      value={value}
      min={0}
      disabled={isSaving}
      onValueChange={(next) => setValue(next ?? 0)}
    >
      <NumberFieldGroup>
        <NumberFieldDecrement />
        <NumberFieldInput
          onBlur={() => {
            if (value !== quantity) onCommit(value)
          }}
        />
        <NumberFieldIncrement />
      </NumberFieldGroup>
    </NumberField>
  )
}
