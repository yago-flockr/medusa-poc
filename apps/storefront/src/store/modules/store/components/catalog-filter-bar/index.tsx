"use client"

import { RiFilterLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useProductListQueryParams } from "@/store/lib/hooks/use-product-list-query-params"
import CategoryPills from "@/store/modules/store/components/category-pills"
import OptionsPicker from "@/store/modules/store/components/refinement-list/options-picker"
import SortProducts, {
  SortOptions,
} from "@/store/modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"

type CatalogFilterBarProps = {
  categories: HttpTypes.StoreProductCategory[]
  options: HttpTypes.StoreProductOption[]
  sortBy: SortOptions
}

const CatalogFilterBar = ({
  categories,
  options,
  sortBy,
}: CatalogFilterBarProps) => {
  const { setQueryParams, selectedOptionValueIds, setOptionValueIds } =
    useProductListQueryParams()

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-6">
      <CategoryPills categories={categories} />
      <div className="flex items-center gap-2">
        <Drawer swipeDirection="left">
          <DrawerTrigger
            render={
              <Button variant="outline">
                <RiFilterLine data-icon="inline-start" />
                Filters
                {selectedOptionValueIds.length > 0 &&
                  ` (${selectedOptionValueIds.length})`}
              </Button>
            }
          />
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-4">
              <OptionsPicker
                options={options}
                selectedValueIds={selectedOptionValueIds}
                setOptionValueIds={setOptionValueIds}
              />
            </div>
            <DrawerFooter>
              <DrawerClose render={<Button variant="outline">Close</Button>} />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <SortProducts sortBy={sortBy} setQueryParams={setQueryParams} />
      </div>
    </div>
  )
}

export default CatalogFilterBar
