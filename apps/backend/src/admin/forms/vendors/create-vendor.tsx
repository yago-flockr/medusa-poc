import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { useForm } from "react-hook-form"
import {
  createVendorSchema,
  type CreateVendor,
} from "../../../api/admin/vendors/contract"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export const CREATE_VENDOR_FORM_ID = "create-vendor-form"

export type CreateVendorFormProps = CommonFormProps<CreateVendor>

export const CreateVendorForm = ({
  defaultValues,
  isDisabled,
  isLoading,
  onSubmit,
}: CreateVendorFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof createVendorSchema>, unknown, CreateVendor>({
    resolver: zodResolver(createVendorSchema),
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
      id={CREATE_VENDOR_FORM_ID}
      onSubmit={submit}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <TextField
        id="create-vendor-name"
        label="Vendor name"
        error={errors.name?.message}
        disabled={isDisabled || isLoading}
        {...register("name")}
      />
      <TextField
        id="create-vendor-handle"
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
