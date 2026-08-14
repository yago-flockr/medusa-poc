import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Button,
  FocusModal,
  Heading,
  Hint,
  Input,
  Label,
  Text,
  toast,
} from "@medusajs/ui"
import {
  createBrandSchema,
  type CreateBrand,
} from "../../../api/admin/brands/contract"
import { useCreateBrand } from "../../hooks/mutations/brands"

export const CreateBrandForm = () => {
  const [open, setOpen] = useState(false)
  const { mutateAsync: createBrand, isPending } = useCreateBrand()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBrand>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      name: "",
      handle: "",
    },
  })

  const onOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset()
    }
    setOpen(nextOpen)
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { brand } = await createBrand(values)
      toast.success(`Brand "${brand.name}" created`)
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create brand"
      )
    }
  })

  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Trigger asChild>
        <Button size="small" variant="secondary">
          Create
        </Button>
      </FocusModal.Trigger>
      <FocusModal.Content>
        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <FocusModal.Header />
          <FocusModal.Body className="flex flex-1 flex-col items-center overflow-y-auto py-16">
            <div className="flex w-full max-w-[720px] flex-col gap-y-8">
              <div>
                <FocusModal.Title asChild>
                  <Heading>Create Brand</Heading>
                </FocusModal.Title>
                <Text size="small" className="text-ui-fg-subtle">
                  Create a new brand and manage its details.
                </Text>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label htmlFor="create-brand-name" size="small">
                      Name
                    </Label>
                  </div>
                  <Input id="create-brand-name" {...register("name")} />
                  {errors.name?.message && (
                    <Hint variant="error">{errors.name.message}</Hint>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label htmlFor="create-brand-handle" size="small">
                      Handle
                    </Label>
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-muted"
                    >
                      (Optional)
                    </Text>
                  </div>
                  <Input
                    id="create-brand-handle"
                    placeholder="acme"
                    {...register("handle")}
                  />
                  {errors.handle?.message && (
                    <Hint variant="error">{errors.handle.message}</Hint>
                  )}
                </div>
              </div>
            </div>
          </FocusModal.Body>
          <FocusModal.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <FocusModal.Close asChild>
                <Button size="small" variant="secondary" type="button">
                  Cancel
                </Button>
              </FocusModal.Close>
              <Button type="submit" size="small" isLoading={isPending}>
                Create
              </Button>
            </div>
          </FocusModal.Footer>
        </form>
      </FocusModal.Content>
    </FocusModal>
  )
}
