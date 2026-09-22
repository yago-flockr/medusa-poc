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
import type { Affiliate } from "@dtc/api-contracts/admin/affiliates"
import { Card } from "../../components/card"
import { OtpShow } from "../../components/otp-show"
import { TitleSubtitle } from "../../components/title-subtitle"
import {
  useDeleteOneAffiliate,
  useRegenerateAffiliatePassword,
  useUpdateOneAffiliate,
} from "../../hooks/mutations/affiliates"
import { useFindManyAffiliates } from "../../hooks/queries/affiliates"
import { CreateAffiliateModal } from "./create-affiliate-modal"
import { UpdateAffiliateDrawer } from "./update-affiliate-drawer"

const PAGINATION_LIMIT = 15

const columnHelper = createDataTableColumnHelper<Affiliate>()

const AffiliatesPage = () => {
  const prompt = usePrompt()
  const regeneratePassword = useRegenerateAffiliatePassword()
  const updateOneAffiliate = useUpdateOneAffiliate()
  const deleteOneAffiliate = useDeleteOneAffiliate()
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: PAGINATION_LIMIT,
    pageIndex: 0,
  })
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(
    null,
  )
  const [regeneratedPassword, setRegeneratedPassword] = useState<string>()

  const findManyAffiliates = useFindManyAffiliates({
    limit: PAGINATION_LIMIT,
    offset: pagination.pageIndex * PAGINATION_LIMIT,
  })

  const columns = [
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("handle", { header: "Code" }),
    columnHelper.accessor("email", { header: "Email" }),
    columnHelper.accessor("commission_rate", {
      header: "Commission",
      cell: ({ getValue }) => `${Math.round(getValue() * 100)}%`,
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
            setEditingAffiliate(ctx.row.original)
          },
        },
        {
          label: "Regenerate Password",
          icon: <ArrowPath />,
          onClick: async () => {
            const affiliate = ctx.row.original
            const confirmed = await prompt({
              title: "Regenerate Password?",
              description: `This immediately invalidates ${affiliate.email}'s current password. Share the new one with them yourself.`,
              confirmText: "Regenerate",
              cancelText: "Cancel",
              variant: "danger",
            })

            if (!confirmed) {
              return
            }

            regeneratePassword.mutate(affiliate.id, {
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
            const affiliate = ctx.row.original

            if (affiliate.is_active) {
              const confirmed = await prompt({
                title: "Disable affiliate?",
                description: `Disabling ${affiliate.name} stops new orders being attributed to "${affiliate.handle}". Orders already attributed to them are untouched.`,
                confirmText: "Disable",
                cancelText: "Cancel",
                variant: "danger",
              })

              if (!confirmed) {
                return
              }
            }

            updateOneAffiliate.mutate(
              {
                affiliateId: affiliate.id,
                body: { is_active: !affiliate.is_active },
              },
              {
                onError: (error) => {
                  toast.error("Failed to update affiliate status", {
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
            const affiliate = ctx.row.original
            const confirmed = await prompt({
              title: "Delete affiliate?",
              description: `Delete ${affiliate.name}? This is refused once any order has been attributed to them — disable them instead so those orders keep their attribution.`,
              confirmText: "Delete",
              cancelText: "Cancel",
              variant: "danger",
            })

            if (!confirmed) {
              return
            }

            deleteOneAffiliate.mutate(affiliate.id, {
              onError: (error) => {
                toast.error("Failed to delete affiliate", {
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
    data: findManyAffiliates.data?.affiliates ?? [],
    getRowId: (row) => row.id,
    rowCount: findManyAffiliates.data?.count ?? 0,
    isLoading: findManyAffiliates.isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title
          title="Affiliates"
          description="People who promote vendor products and earn a commission on orders their code brings in. Their handle is the referral code customers arrive with."
        />
        <CreateAffiliateModal />
      </Card.Header>
      <DataTable instance={table}>
        <DataTable.Table
          emptyState={{
            empty: {
              custom: (
                <TitleSubtitle
                  title="No affiliates"
                  description="There are no affiliates to display."
                />
              ),
            },
            filtered: {
              custom: (
                <TitleSubtitle
                  title="No results"
                  description="No affiliates match the current filter criteria."
                />
              ),
            },
          }}
        />
        <DataTable.Pagination />
      </DataTable>
      <UpdateAffiliateDrawer
        affiliate={editingAffiliate}
        onClose={() => setEditingAffiliate(null)}
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
  label: "Affiliates",
})

export default AffiliatesPage
