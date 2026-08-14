import { Button, FocusModal } from "@medusajs/ui"
import { useState } from "react"
import { CreateBrandForm } from "../../forms/brands/create-brand"
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
        {open ? (
          <CreateBrandForm
            isLoading={createOneBrand.isPending}
            onCancel={() => setOpen(false)}
            onSubmit={(values) => {
              createOneBrand.mutate(values, {
                onSuccess: () => {
                  setOpen(false)
                },
              })
            }}
          />
        ) : null}
      </FocusModal.Content>
    </FocusModal>
  )
}
