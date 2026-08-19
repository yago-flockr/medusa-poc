import { defineRouteConfig } from "@medusajs/admin-sdk"
import { PencilSquare, Trash } from "@medusajs/icons"
import {
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
  usePrompt,
} from "@medusajs/ui"
import { useState } from "react"
import type { Brand } from "../../../api/admin/brands/contract"
import { Card } from "../../components/card"
import { TitleSubtitle } from "../../components/title-subtitle"
import { useDeleteOneBrand } from "../../hooks/mutations/brands"
import { useFindManyBrands } from "../../hooks/queries/brands"
import { CreateBrandModal } from "./create-brand-modal"
import { UpdateBrandDrawer } from "./update-brand-drawer"

const PAGINATION_LIMIT = 15

const columnHelper = createDataTableColumnHelper<Brand>()

const BrandsPage = () => {
  const prompt = usePrompt()
  const deleteOneBrand = useDeleteOneBrand()
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: PAGINATION_LIMIT,
    pageIndex: 0,
  })
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  const findManyBrands = useFindManyBrands({
    limit: PAGINATION_LIMIT,
    offset: pagination.pageIndex * PAGINATION_LIMIT,
  })

  const columns = [
    columnHelper.accessor("id", { header: "ID" }),
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("handle", { header: "Handle" }),
    columnHelper.action({
      actions: [
        {
          label: "Edit",
          icon: <PencilSquare />,
          onClick: (ctx) => {
            setEditingBrand(ctx.row.original)
          },
        },
        {
          label: "Delete",
          icon: <Trash />,
          onClick: async (ctx) => {
            const brand = ctx.row.original
            const confirmed = await prompt({
              title: "Delete brand?",
              description: `Delete "${brand.name}"? Linked products will be unlinked from this brand.`,
              confirmText: "Delete",
              cancelText: "Cancel",
              variant: "danger",
            })

            if (confirmed) deleteOneBrand.mutate(brand.id)
          },
        },
      ],
    }),
  ]

  const table = useDataTable({
    columns,
    data: findManyBrands.data?.brands ?? [],
    getRowId: (row) => row.id,
    rowCount: findManyBrands.data?.count ?? 0,
    isLoading: findManyBrands.isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title title="Brands" />
        <CreateBrandModal />
      </Card.Header>
      <DataTable instance={table}>
        <DataTable.Table
          emptyState={{
            empty: {
              custom: (
                <TitleSubtitle
                  title="No brands"
                  description="There are no brands to display."
                />
              ),
            },
            filtered: {
              custom: (
                <TitleSubtitle
                  title="No results"
                  description="No brands match the current filter criteria."
                />
              ),
            },
          }}
        />
        <DataTable.Pagination />
      </DataTable>
      <UpdateBrandDrawer
        brand={editingBrand}
        onClose={() => setEditingBrand(null)}
      />
    </Card.Root>
  )
}

export const config = defineRouteConfig({
  label: "Brands",
})

export default BrandsPage
