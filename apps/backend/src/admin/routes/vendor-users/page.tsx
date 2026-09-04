import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArrowPath,
  CheckCircle,
  PencilSquare,
  Trash,
  XCircle,
} from "@medusajs/icons"
import {
  Button,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  FocusModal,
  StatusBadge,
  toast,
  useDataTable,
  usePrompt,
} from "@medusajs/ui"
import { useState } from "react"
import type { VendorUser } from "@dtc/api-contracts/admin/vendor-users"
import { Card } from "../../components/card"
import { OtpShow } from "../../components/otp-show"
import { TitleSubtitle } from "../../components/title-subtitle"
import {
  useDeleteOneVendorUser,
  useRegenerateVendorUserPassword,
  useUpdateOneVendorUser,
} from "../../hooks/mutations/vendor-users"
import { useFindManyVendorUsers } from "../../hooks/queries/vendor-users"
import { CreateVendorUserModal } from "./create-vendor-user-modal"
import { UpdateVendorUserDrawer } from "./update-vendor-user-drawer"

const PAGINATION_LIMIT = 15

const columnHelper = createDataTableColumnHelper<VendorUser>()

const VendorUsersPage = () => {
  const prompt = usePrompt()
  const regeneratePassword = useRegenerateVendorUserPassword()
  const updateOneVendorUser = useUpdateOneVendorUser()
  const deleteOneVendorUser = useDeleteOneVendorUser()
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
            setEditingVendorUser(ctx.row.original)
          },
        },
        {
          label: "Regenerate Password",
          icon: <ArrowPath />,
          onClick: async () => {
            const vendorUser = ctx.row.original
            const confirmed = await prompt({
              title: "Regenerate Password?",
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
        {
          icon: ctx.row.original.is_active ? <XCircle /> : <CheckCircle />,
          label: ctx.row.original.is_active ? "Disable" : "Enable",
          onClick: async () => {
            const vendorUser = ctx.row.original

            if (vendorUser.is_active) {
              const confirmed = await prompt({
                title: "Disable vendor user?",
                description: `Disabling ${vendorUser.email} immediately blocks them from doing anything further — creating or editing products, viewing orders, etc.`,
                confirmText: "Disable",
                cancelText: "Cancel",
                variant: "danger",
              })

              if (!confirmed) {
                return
              }
            }

            updateOneVendorUser.mutate(
              {
                vendorUserId: vendorUser.id,
                body: {
                  is_active: !vendorUser.is_active,
                  first_name: undefined,
                  last_name: undefined,
                },
              },
              {
                onError: (error) => {
                  toast.error("Failed to update vendor user status", {
                    description: error.message,
                  })
                },
              },
            )
          },
        },
        {
          label: "Delete",
          icon: <Trash />,
          onClick: async () => {
            const vendorUser = ctx.row.original
            const confirmed = await prompt({
              title: "Delete vendor user?",
              description: `Delete ${vendorUser.email}? This only removes their login — it does not affect the vendor's products, orders, or stock.`,
              confirmText: "Delete",
              cancelText: "Cancel",
              variant: "danger",
            })

            if (!confirmed) {
              return
            }

            deleteOneVendorUser.mutate(vendorUser.id, {
              onError: (error) => {
                toast.error("Failed to delete vendor user", {
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
              custom: (
                <TitleSubtitle
                  title="No vendor users"
                  description="There are no vendor users to display."
                />
              ),
            },
            filtered: {
              custom: (
                <TitleSubtitle
                  title="No results"
                  description="No vendor users match the current filter criteria."
                />
              ),
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
