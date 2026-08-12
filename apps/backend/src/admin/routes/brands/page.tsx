import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState } from "react"
import {
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
} from "@medusajs/ui"
import { Card } from "../../components/card"
import { useAdminBrandList, type Brand } from "../../hooks/queries/brands"

const PAGINATION_LIMIT = 15

const columnHelper = createDataTableColumnHelper<Brand>()

const columns = [
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("handle", { header: "Handle" }),
]

const BrandsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: PAGINATION_LIMIT,
    pageIndex: 0,
  })

  const adminBrandList = useAdminBrandList({
    limit: PAGINATION_LIMIT,
    offset: pagination.pageIndex * PAGINATION_LIMIT,
  })

  const table = useDataTable({
    columns,
    data: adminBrandList.data?.brands ?? [],
    getRowId: (row) => row.id,
    rowCount: adminBrandList.data?.count ?? 0,
    isLoading: adminBrandList.isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title title="Brands" />
      </Card.Header>
      <DataTable instance={table}>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Card.Root>
  )
}

export const config = defineRouteConfig({
  label: "Brands",
})

export default BrandsPage
