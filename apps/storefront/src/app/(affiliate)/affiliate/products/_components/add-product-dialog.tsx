"use client"

import { DataState } from "@/components/display/data-state"
import { FormDialog } from "@/components/display/form-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { useGetStoreProducts } from "@/affiliate/hooks/queries/store-products"
import { RiSearchLine } from "@remixicon/react"
import { useEffect, useState } from "react"

type AddProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotedIds: Set<string>
  isAdding: boolean
  onAdd: (productId: string) => void
}

export function AddProductDialog({
  open,
  onOpenChange,
  promotedIds,
  isAdding,
  onAdd,
}: AddProductDialogProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const getStoreProducts = useGetStoreProducts(debouncedSearch)
  const products = getStoreProducts.data?.products ?? []

  return (
    <FormDialog
      title="Promote a product"
      description="Search the catalogue and pick what you want to promote."
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-3">
        <div className="relative">
          <RiSearchLine className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            className="pl-9"
            placeholder="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <DataState
          isLoading={getStoreProducts.isLoading}
          isEmpty={products.length === 0}
        >
          <DataState.Loading />
          <DataState.Empty>No products match that search.</DataState.Empty>
          <DataState.Content>
            <ItemGroup className="max-h-80 overflow-y-auto">
              {products.map((product) => {
                const isPromoted = promotedIds.has(product.id)

                return (
                  <Item key={product.id} variant="outline">
                    <ItemContent>
                      <ItemTitle>{product.title}</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPromoted || isAdding}
                        onClick={() => onAdd(product.id)}
                      >
                        {isPromoted ? "Promoted" : "Promote"}
                      </Button>
                    </ItemActions>
                  </Item>
                )
              })}
            </ItemGroup>
          </DataState.Content>
        </DataState>
      </div>
    </FormDialog>
  )
}
