import { Button, FocusModal, toast } from "@medusajs/ui"
import { useState } from "react"
import { TitleSubtitle } from "../../components/title-subtitle"
import {
  CREATE_BRAND_FORM_ID,
  CreateBrandForm,
} from "../../forms/brands/create-brand"
import { useCreateOneBrand } from "../../hooks/mutations/brands"

export const CreateBrandModal = () => {
  const [open, setOpen] = useState(false)
  const createOneBrand = useCreateOneBrand()

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
              title="Create Brand"
              description="Create a new brand and manage its details."
            />
            <CreateBrandForm
              isLoading={createOneBrand.isPending}
              onSubmit={(values) => {
                createOneBrand.mutate(values, {
                  onSuccess: () => {
                    setOpen(false)
                  },
                  onError: (error) => {
                    toast.error("Failed to create brand", {
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
              disabled={createOneBrand.isPending}
            >
              Cancel
            </Button>
            <Button
              size="small"
              type="submit"
              form={CREATE_BRAND_FORM_ID}
              isLoading={createOneBrand.isPending}
            >
              Create
            </Button>
          </div>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}
