import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CheckCircle, PencilSquare, XCircle } from "@medusajs/icons"
import {
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  StatusBadge,
  toast,
  useDataTable,
  usePrompt,
} from "@medusajs/ui"
import { useState } from "react"
import type { Vendor } from "../../../api/admin/vendors/contract"
import { Card } from "../../components/card"
import { TitleSubtitle } from "../../components/title-subtitle"
import { useUpdateOneVendor } from "../../hooks/mutations/vendors"
import { useFindManyVendors } from "../../hooks/queries/vendors"
import { CreateVendorModal } from "./create-vendor-modal"
import { UpdateVendorDrawer } from "./update-vendor-drawer"

const PAGINATION_LIMIT = 15

const columnHelper = createDataTableColumnHelper<Vendor>()

const VendorsPage = () => {
  const prompt = usePrompt()
  const updateOneVendor = useUpdateOneVendor()
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
    columnHelper.accessor("is_active", {
      header: "Status",
      cell: ({ getValue }) =>
        getValue() ? (
          <StatusBadge color="green">Active</StatusBadge>
        ) : (
          <StatusBadge color="red">Disabled</StatusBadge>
        ),
    }),
    columnHelper.action({
      actions: (ctx) => [
        {
          label: "Edit",
          icon: <PencilSquare />,
          onClick: () => {
            setEditingVendor(ctx.row.original)
          },
        },
        {
          icon: ctx.row.original.is_active ? <XCircle /> : <CheckCircle />,
          label: ctx.row.original.is_active ? "Disable" : "Enable",
          onClick: async () => {
            const vendor = ctx.row.original

            if (vendor.is_active) {
              const confirmed = await prompt({
                title: "Disable vendor?",
                description: `Disabling "${vendor.name}" blocks it and all its users from doing anything further — creating or editing products, viewing orders, etc. Existing orders and products are unaffected.`,
                confirmText: "Disable",
                cancelText: "Cancel",
                variant: "danger",
              })

              if (!confirmed) {
                return
              }
            }

            updateOneVendor.mutate(
              {
                vendorId: vendor.id,
                body: { is_active: !vendor.is_active, handle: undefined },
              },
              {
                onError: (error) => {
                  toast.error("Failed to update vendor status", {
                    description: error.message,
                  })
                },
              },
            )
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
              custom: (
                <TitleSubtitle
                  title="No vendors"
                  description="There are no vendors to display."
                />
              ),
            },
            filtered: {
              custom: (
                <TitleSubtitle
                  title="No results"
                  description="No vendors match the current filter criteria."
                />
              ),
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
