import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  createBrandSchema,
  type Brand,
  type CreateBrand,
} from "@dtc/api-contracts/admin/brands"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export const UPDATE_BRAND_FORM_ID = "update-brand-form"

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
  onSubmit,
}: UpdateBrandFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof createBrandSchema>, unknown, CreateBrand>({
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
    <form
      id={UPDATE_BRAND_FORM_ID}
      onSubmit={submit}
      className="grid grid-cols-1 gap-4"
    >
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
    </form>
  )
}
