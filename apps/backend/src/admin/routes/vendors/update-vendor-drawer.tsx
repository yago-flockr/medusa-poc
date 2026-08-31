import { Button, Drawer, Text, toast } from "@medusajs/ui"
import type { Vendor } from "@dtc/api-contracts/admin/vendors"
import { Divider } from "../../components/divider"
import { TitleSubtitle } from "../../components/title-subtitle"
import {
  UPDATE_VENDOR_FORM_ID,
  UpdateVendorForm,
  vendorToForm,
} from "../../forms/vendors/update-vendor"
import { useUpdateOneVendor } from "../../hooks/mutations/vendors"

type UpdateVendorDrawerProps = {
  vendor: Vendor | null
  onClose: () => void
}

export const UpdateVendorDrawer = ({
  vendor,
  onClose,
}: UpdateVendorDrawerProps) => {
  const updateOneVendor = useUpdateOneVendor()
  const users = vendor?.users ?? []

  return (
    <Drawer open={Boolean(vendor)} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <TitleSubtitle title="Update Vendor" />
        </Drawer.Header>
        <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
          <UpdateVendorForm
            defaultValues={vendor ? vendorToForm(vendor) : undefined}
            isLoading={updateOneVendor.isPending}
            onSubmit={(values) => {
              if (!vendor) {
                return
              }

              updateOneVendor.mutate(
                { vendorId: vendor.id, body: values },
                {
                  onSuccess: () => {
                    onClose()
                  },
                  onError: (error) => {
                    toast.error("Failed to update vendor", {
                      description: error.message,
                    })
                  },
                },
              )
            }}
          />
          <div className="flex flex-col gap-y-4">
            <Divider>Users</Divider>
            {users.length === 0 ? (
              <Text size="small" className="text-ui-fg-subtle">
                No users yet.
              </Text>
            ) : (
              <ul className="flex flex-col gap-y-1">
                {users.map((user) => (
                  <li className="flex items-center gap-x-2" key={user.id}>
                    <Text size="small">
                      {[user.first_name, user.last_name]
                        .filter(Boolean)
                        .join(" ") || user.email}{" "}
                    </Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      ({user.email})
                    </Text>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <Button
              size="small"
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={updateOneVendor.isPending}
            >
              Cancel
            </Button>
            <Button
              size="small"
              type="submit"
              form={UPDATE_VENDOR_FORM_ID}
              isLoading={updateOneVendor.isPending}
            >
              Save
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
