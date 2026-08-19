import { Button, FocusModal, toast } from "@medusajs/ui"
import { useState } from "react"
import { TitleSubtitle } from "../../components/title-subtitle"
import {
  CREATE_VENDOR_FORM_ID,
  CreateVendorForm,
} from "../../forms/vendors/create-vendor"
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
        <FocusModal.Header />
        <FocusModal.Body className="flex flex-1 flex-col items-center overflow-y-auto py-16">
          <div className="flex w-full max-w-[720px] flex-col gap-y-8">
            <TitleSubtitle
              title="Create Vendor"
              description="Creates the vendor. Add its first user afterwards from the Vendor Users page."
            />
            <CreateVendorForm
              isLoading={createOneVendor.isPending}
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
          </div>
        </FocusModal.Body>
        <FocusModal.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <Button
              size="small"
              variant="secondary"
              type="button"
              onClick={() => setOpen(false)}
              disabled={createOneVendor.isPending}
            >
              Cancel
            </Button>
            <Button
              size="small"
              type="submit"
              form={CREATE_VENDOR_FORM_ID}
              isLoading={createOneVendor.isPending}
            >
              Create
            </Button>
          </div>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}
