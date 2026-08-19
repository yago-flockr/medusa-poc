import { Drawer, toast } from "@medusajs/ui"
import type { Vendor } from "../../../api/admin/vendors/contract"
import { UpdateVendorForm, vendorToForm } from "../../forms/vendors/update-vendor"
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

  return (
    <Drawer open={Boolean(vendor)} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Content>
        <UpdateVendorForm
          vendor={vendor}
          defaultValues={vendor ? vendorToForm(vendor) : undefined}
          isLoading={updateOneVendor.isPending}
          onCancel={onClose}
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
      </Drawer.Content>
    </Drawer>
  )
}
