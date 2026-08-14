import { defineRouteConfig } from "@medusajs/admin-sdk"
import { EllipsisHorizontal } from "@medusajs/icons"
import { useState } from "react"
import {
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  DropdownMenu,
  IconButton,
  toast,
  useDataTable,
  usePrompt,
} from "@medusajs/ui"
import { Card } from "../../components/card"
import { useDeleteBrand } from "../../hooks/mutations/brands"
import { useAdminBrandList, type Brand } from "../../hooks/queries/brands"
import { CreateBrandForm } from "./create-brand-form"
import { EditBrandForm } from "./edit-brand-form"

const PAGINATION_LIMIT = 15

const columnHelper = createDataTableColumnHelper<Brand>()

type BrandRowActionsProps = {
  brand: Brand
  onEdit: (brand: Brand) => void
}

const BrandRowActions = ({ brand, onEdit }: BrandRowActionsProps) => {
  const prompt = usePrompt()
  const { mutateAsync: deleteBrand } = useDeleteBrand()

  const handleDelete = async () => {
    const confirmed = await prompt({
      title: "Delete brand?",
      description: `Delete "${brand.name}"? Linked products will be unlinked from this brand.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    })

    if (!confirmed) {
      return
    }

    try {
      await deleteBrand(brand.id)
      toast.success(`Brand "${brand.name}" deleted`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete brand"
      )
    }
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

  const adminBrandList = useAdminBrandList({
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
        <CreateBrandForm />
      </Card.Header>
      <DataTable instance={table}>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
      <EditBrandForm
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
