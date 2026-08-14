import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Button,
  Drawer,
  Heading,
  Hint,
  Input,
  Label,
  toast,
} from "@medusajs/ui"
import {
  updateBrandSchema,
  type UpdateBrand,
} from "../../../api/admin/brands/contract"
import { useUpdateBrand } from "../../hooks/mutations/brands"
import type { Brand } from "../../hooks/queries/brands"

type EditBrandFormProps = {
  brand: Brand | null
  onClose: () => void
}

export const EditBrandForm = ({ brand, onClose }: EditBrandFormProps) => {
  const { mutateAsync: updateBrand, isPending } = useUpdateBrand(
    brand?.id ?? ""
  )
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateBrand>({
    resolver: zodResolver(updateBrandSchema),
    defaultValues: {
      name: brand?.name ?? "",
      handle: brand?.handle ?? "",
    },
  })

  useEffect(() => {
    if (!brand) {
      return
    }

    reset({
      name: brand.name,
      handle: brand.handle,
    })
  }, [brand, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (!brand) {
      return
    }

    try {
      const { brand: updated } = await updateBrand(values)
      toast.success(`Brand "${updated.name}" updated`)
      onClose()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update brand"
      )
    }
  })

  return (
    <Drawer open={Boolean(brand)} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Content>
        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <Drawer.Header>
            <Heading>Edit brand</Heading>
          </Drawer.Header>
          <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-x-1">
                  <Label htmlFor="edit-brand-name" size="small" weight="plus">
                    Name
                  </Label>
                </div>
                <Input id="edit-brand-name" {...register("name")} />
                {errors.name?.message && (
                  <Hint variant="error">{errors.name.message}</Hint>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-x-1">
                  <Label htmlFor="edit-brand-handle" size="small" weight="plus">
                    Handle
                  </Label>
                </div>
                <Input id="edit-brand-handle" {...register("handle")} />
                {errors.handle?.message && (
                  <Hint variant="error">{errors.handle.message}</Hint>
                )}
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button size="small" variant="secondary" type="button">
                  Cancel
                </Button>
              </Drawer.Close>
              <Button size="small" type="submit" isLoading={isPending}>
                Save
              </Button>
            </div>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}
