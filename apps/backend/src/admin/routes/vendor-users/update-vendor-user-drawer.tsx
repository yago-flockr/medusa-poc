import { Drawer, toast } from "@medusajs/ui"
import type { VendorUser } from "../../../api/admin/vendor-users/contract"
import {
  UpdateVendorUserForm,
  vendorUserToForm,
} from "../../forms/vendor-users/update-vendor-user"
import { useUpdateOneVendorUser } from "../../hooks/mutations/vendor-users"

type UpdateVendorUserDrawerProps = {
  vendorUser: VendorUser | null
  onClose: () => void
}

export const UpdateVendorUserDrawer = ({
  vendorUser,
  onClose,
}: UpdateVendorUserDrawerProps) => {
  const updateOneVendorUser = useUpdateOneVendorUser()

  return (
    <Drawer
      open={Boolean(vendorUser)}
      onOpenChange={(open) => !open && onClose()}
    >
      <Drawer.Content>
        <UpdateVendorUserForm
          vendorUser={vendorUser}
          defaultValues={vendorUser ? vendorUserToForm(vendorUser) : undefined}
          isLoading={updateOneVendorUser.isPending}
          onCancel={onClose}
          onSubmit={(values) => {
            if (!vendorUser) {
              return
            }

            updateOneVendorUser.mutate(
              { vendorUserId: vendorUser.id, body: values },
              {
                onSuccess: () => {
                  onClose()
                },
                onError: (error) => {
                  toast.error("Failed to update vendor user", {
                    description: error.message,
                  })
                },
              },
            )
          }}
        />
      </Drawer.Content>
    </Drawer>
  )
}
