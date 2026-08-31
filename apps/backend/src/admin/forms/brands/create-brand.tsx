import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { useForm } from "react-hook-form"
import {
  createBrandSchema,
  type CreateBrand,
} from "@dtc/api-contracts/admin/brands"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export const CREATE_BRAND_FORM_ID = "create-brand-form"

export type CreateBrandFormProps = CommonFormProps<CreateBrand>

export const CreateBrandForm = ({
  defaultValues,
  isDisabled,
  isLoading,
  onSubmit,
}: CreateBrandFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof createBrandSchema>, unknown, CreateBrand>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      name: "",
      handle: "",
      ...defaultValues,
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values)
  })

  return (
    <form
      id={CREATE_BRAND_FORM_ID}
      onSubmit={submit}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <TextField
        id="create-brand-name"
        label="Name"
        error={errors.name?.message}
        disabled={isDisabled || isLoading}
        {...register("name")}
      />
      <TextField
        id="create-brand-handle"
        label="Handle"
        optional
        placeholder="acme"
        error={errors.handle?.message}
        disabled={isDisabled || isLoading}
        {...register("handle")}
      />
    </form>
  )
}
