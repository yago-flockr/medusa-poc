import { Button, FocusModal, toast } from "@medusajs/ui"
import { useState } from "react"
import { CreateVendorForm } from "../../forms/vendors/create-vendor"
import { useCreateOneVendor } from "../../hooks/mutations/vendors"

export const CreateVendorModal = () => {
  const [open, setOpen] = useState(false)
  const createOneVendor = useCreateOneVendor()

  return (
    <FocusModal open={open} onOpenChange={setOpen}>
      <FocusModal.Trigger asChild>
        <Button size="small" variant="secondary">
          Create
        </Button>
      </FocusModal.Trigger>
      <FocusModal.Content>
        {open ? (
          <CreateVendorForm
            isLoading={createOneVendor.isPending}
            onCancel={() => setOpen(false)}
            onSubmit={(values) => {
              createOneVendor.mutate(values, {
                onSuccess: () => {
                  setOpen(false)
                },
                onError: (error) => {
                  toast.error("Failed to create vendor", {
                    description: error.message,
                  })
                },
              })
            }}
          />
        ) : null}
      </FocusModal.Content>
    </FocusModal>
  )
}
