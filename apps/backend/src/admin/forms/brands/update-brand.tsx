import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Drawer, Heading } from "@medusajs/ui"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
    createBrandSchema,
    type Brand,
    type CreateBrand,
} from "../../../api/admin/brands/contract"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export type UpdateBrandFormProps = CommonFormProps<CreateBrand>

export function brandToForm(brand: Brand): CreateBrand {
  return {
    name: brand.name,
    handle: brand.handle,
  }
}

export const UpdateBrandForm = ({
  defaultValues,
  isDisabled,
  isLoading,
  onCancel,
  onSubmit,
}: UpdateBrandFormProps) => {
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
      ...defaultValues,
    },
  })

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
      handle: defaultValues?.handle ?? "",
    })
  }, [defaultValues?.name, defaultValues?.handle, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values)
  })

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
      <Drawer.Header>
        <Heading>Edit Brand</Heading>
      </Drawer.Header>
      <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
          <TextField
            id="update-brand-name"
            label="Name"
            error={errors.name?.message}
            disabled={isDisabled || isLoading}
            {...register("name")}
          />
          <TextField
            id="update-brand-handle"
            label="Handle"
            placeholder="acme"
            error={errors.handle?.message}
            disabled={isDisabled || isLoading}
            {...register("handle")}
          />
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <div className="flex items-center justify-end gap-x-2">
          <Button
            size="small"
            variant="secondary"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="small"
            type="submit"
            isLoading={isLoading}
            disabled={isDisabled}
          >
            Save
          </Button>
        </div>
      </Drawer.Footer>
    </form>
  )
}
