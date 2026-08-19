import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowPath, PencilSquare } from "@medusajs/icons"
import {
  Button,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  FocusModal,
  toast,
  useDataTable,
  usePrompt,
} from "@medusajs/ui"
import { useState } from "react"
import type { VendorUser } from "../../../api/admin/vendor-users/contract"
import { Card } from "../../components/card"
import { OtpShow } from "../../components/otp-show"
import { useRegenerateVendorUserPassword } from "../../hooks/mutations/vendor-users"
import { useFindManyVendorUsers } from "../../hooks/queries/vendor-users"
import { CreateVendorUserModal } from "./create-vendor-user-modal"
import { UpdateVendorUserDrawer } from "./update-vendor-user-drawer"

const PAGINATION_LIMIT = 15

const columnHelper = createDataTableColumnHelper<VendorUser>()

const VendorUsersPage = () => {
  const prompt = usePrompt()
  const regeneratePassword = useRegenerateVendorUserPassword()
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: PAGINATION_LIMIT,
    pageIndex: 0,
  })
  const [editingVendorUser, setEditingVendorUser] = useState<VendorUser | null>(
    null,
  )
  const [regeneratedPassword, setRegeneratedPassword] = useState<string>()

  const findManyVendorUsers = useFindManyVendorUsers({
    limit: PAGINATION_LIMIT,
    offset: pagination.pageIndex * PAGINATION_LIMIT,
  })

  const columns = [
    columnHelper.accessor("email", { header: "Email" }),
    columnHelper.accessor((row) => row.vendor?.name ?? row.vendor_id, {
      id: "vendor",
      header: "Vendor",
    }),
    columnHelper.accessor(
      (row) => [row.first_name, row.last_name].filter(Boolean).join(" "),
      { id: "name", header: "Name" },
    ),
    columnHelper.action({
      actions: [
        {
          label: "Edit",
          icon: <PencilSquare />,
          onClick: (ctx) => {
            setEditingVendorUser(ctx.row.original)
          },
        },
        {
          label: "Regenerate password",
          icon: <ArrowPath />,
          onClick: async (ctx) => {
            const vendorUser = ctx.row.original
            const confirmed = await prompt({
              title: "Regenerate password?",
              description: `This immediately invalidates ${vendorUser.email}'s current password. Share the new one with them yourself.`,
              confirmText: "Regenerate",
              cancelText: "Cancel",
              variant: "danger",
            })

            if (!confirmed) {
              return
            }

            regeneratePassword.mutate(vendorUser.id, {
              onSuccess: (data) => {
                setRegeneratedPassword(data.password)
              },
              onError: (error) => {
                toast.error("Failed to regenerate password", {
                  description: error.message,
                })
              },
            })
          },
        },
      ],
    }),
  ]

  const table = useDataTable({
    columns,
    data: findManyVendorUsers.data?.vendor_users ?? [],
    getRowId: (row) => row.id,
    rowCount: findManyVendorUsers.data?.count ?? 0,
    isLoading: findManyVendorUsers.isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title
          title="Vendor Users"
          description="Each user is created with a random password shown once — there is no invite email or self-service reset yet, so share it with the vendor yourself."
        />
        <CreateVendorUserModal />
      </Card.Header>
      <DataTable instance={table}>
        <DataTable.Table
          emptyState={{
            empty: {
              heading: "No vendor users",
              description: "There are no vendor users to display.",
            },
            filtered: {
              heading: "No results",
              description: "No vendor users match the current filter criteria.",
            },
          }}
        />
        <DataTable.Pagination />
      </DataTable>
      <UpdateVendorUserDrawer
        vendorUser={editingVendorUser}
        onClose={() => setEditingVendorUser(null)}
      />
      <FocusModal
        open={Boolean(regeneratedPassword)}
        onOpenChange={(open) => !open && setRegeneratedPassword(undefined)}
      >
        <FocusModal.Content>
          <FocusModal.Header />
          <FocusModal.Body className="flex flex-1 items-center justify-center">
            {regeneratedPassword ? <OtpShow otp={regeneratedPassword} /> : null}
          </FocusModal.Body>
          <FocusModal.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Button
                size="small"
                variant="secondary"
                type="button"
                onClick={() => setRegeneratedPassword(undefined)}
              >
                Close
              </Button>
            </div>
          </FocusModal.Footer>
        </FocusModal.Content>
      </FocusModal>
    </Card.Root>
  )
}

export const config = defineRouteConfig({
  label: "Vendor Users",
})

export default VendorUsersPage
