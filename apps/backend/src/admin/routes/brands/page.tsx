import { defineRouteConfig } from "@medusajs/admin-sdk"
import { EllipsisHorizontal } from "@medusajs/icons"
import {
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  DropdownMenu,
  IconButton,
  useDataTable,
  usePrompt,
} from "@medusajs/ui"
import { useState } from "react"
import type { Brand } from "../../../api/admin/brands/contract"
import { Card } from "../../components/card"
import { useDeleteOneBrand } from "../../hooks/mutations/brands"
import { useFindManyBrands } from "../../hooks/queries/brands"
import { CreateBrandModal } from "./create-brand-modal"
import { UpdateBrandDrawer } from "./update-brand-drawer"

const PAGINATION_LIMIT = 15

const columnHelper = createDataTableColumnHelper<Brand>()

type BrandRowActionsProps = {
  brand: Brand
  onEdit: (brand: Brand) => void
}

const BrandRowActions = ({ brand, onEdit }: BrandRowActionsProps) => {
  const prompt = usePrompt()
  const deleteOneBrand = useDeleteOneBrand()

  const handleDelete = async () => {
    const confirmed = await prompt({
      title: "Delete brand?",
      description: `Delete "${brand.name}"? Linked products will be unlinked from this brand.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    })

    if (!confirmed) return
    
    deleteOneBrand.mutate(brand.id)
  }

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton variant="transparent" size="small">
          <EllipsisHorizontal />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={() => onEdit(brand)}>
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleDelete}>Delete</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

const BrandsPage = () => {
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
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <BrandRowActions brand={row.original} onEdit={setEditingBrand} />
      ),
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
        <DataTable.Table />
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
