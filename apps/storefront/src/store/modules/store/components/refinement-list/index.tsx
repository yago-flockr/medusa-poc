"use client"

import { useProductListQueryParams } from "@/store/lib/hooks/use-product-list-query-params"
import SortProducts, { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy: SortOptions
  "data-testid"?: string
}

const RefinementList = ({
  sortBy,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const { setQueryParams } = useProductListQueryParams()

  return (
    <div className="mb-8 py-4 pl-6 sm:ml-6 sm:min-w-62.5 sm:px-0">
      <SortProducts
        sortBy={sortBy}
        setQueryParams={setQueryParams}
        data-testid={dataTestId}
      />
    </div>
  )
}

export default RefinementList
