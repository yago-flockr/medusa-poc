import { Button, Drawer, Text, toast } from "@medusajs/ui"
import type { VendorUser } from "../../../api/admin/vendor-users/contract"
import { TitleSubtitle } from "../../components/title-subtitle"
import {
  UPDATE_VENDOR_USER_FORM_ID,
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
        <Drawer.Header>
          <TitleSubtitle title="Update Vendor User" />
        </Drawer.Header>
        <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
          <div className="flex flex-col space-y-2">
            <Text size="small" weight="plus">
              Email
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              {vendorUser?.email}
            </Text>
          </div>
          <UpdateVendorUserForm
            defaultValues={
              vendorUser ? vendorUserToForm(vendorUser) : undefined
            }
            isLoading={updateOneVendorUser.isPending}
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
        </Drawer.Body>
        <Drawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <Button
              size="small"
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={updateOneVendorUser.isPending}
            >
              Cancel
            </Button>
            <Button
              size="small"
              type="submit"
              form={UPDATE_VENDOR_USER_FORM_ID}
              isLoading={updateOneVendorUser.isPending}
            >
              Save
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
