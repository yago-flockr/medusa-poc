import { defineRouteConfig } from "@medusajs/admin-sdk"
import { PencilSquare } from "@medusajs/icons"
import {
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
} from "@medusajs/ui"
import { useState } from "react"
import type { Vendor } from "../../../api/admin/vendors/contract"
import { Card } from "../../components/card"
import { useFindManyVendors } from "../../hooks/queries/vendors"
import { CreateVendorModal } from "./create-vendor-modal"
import { UpdateVendorDrawer } from "./update-vendor-drawer"

const PAGINATION_LIMIT = 15

const columnHelper = createDataTableColumnHelper<Vendor>()

const VendorsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: PAGINATION_LIMIT,
    pageIndex: 0,
  })
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)

  const findManyVendors = useFindManyVendors({
    limit: PAGINATION_LIMIT,
    offset: pagination.pageIndex * PAGINATION_LIMIT,
  })

  const columns = [
    columnHelper.accessor("id", { header: "ID" }),
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("handle", { header: "Handle" }),
    columnHelper.accessor((row) => row.users?.length ?? 0, {
      id: "users",
      header: "Users",
    }),
    columnHelper.action({
      actions: [
        {
          label: "Edit",
          icon: <PencilSquare />,
          onClick: (ctx) => {
            setEditingVendor(ctx.row.original)
          },
        },
      ],
    }),
  ]

  const table = useDataTable({
    columns,
    data: findManyVendors.data?.vendors ?? [],
    getRowId: (row) => row.id,
    rowCount: findManyVendors.data?.count ?? 0,
    isLoading: findManyVendors.isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title
          title="Vendors"
          description="Staff creates vendors here — there is no self-service signup or invite email yet, so share the password you set with the vendor directly."
        />
        <CreateVendorModal />
      </Card.Header>
      <DataTable instance={table}>
        <DataTable.Table
          emptyState={{
            empty: {
              heading: "No vendors",
              description: "There are no vendors to display.",
            },
            filtered: {
              heading: "No results",
              description: "No vendors match the current filter criteria.",
            },
          }}
        />
        <DataTable.Pagination />
      </DataTable>
      <UpdateVendorDrawer
        vendor={editingVendor}
        onClose={() => setEditingVendor(null)}
      />
    </Card.Root>
  )
}

export const config = defineRouteConfig({
  label: "Vendors",
})

export default VendorsPage
