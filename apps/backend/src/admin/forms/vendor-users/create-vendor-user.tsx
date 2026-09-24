import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { useForm } from "react-hook-form"
import {
  createVendorUserSchema,
  type CreateVendorUser,
} from "@dtc/api-contracts/admin/vendor-users"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export const CREATE_VENDOR_USER_FORM_ID = "create-vendor-user-form"

export type CreateVendorUserFormProps = CommonFormProps<CreateVendorUser>

export const CreateVendorUserForm = ({
  defaultValues,
  isDisabled,
  isLoading,
  onSubmit,
}: CreateVendorUserFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<
    z.input<typeof createVendorUserSchema>,
    unknown,
    CreateVendorUser
  >({
    resolver: zodResolver(createVendorUserSchema),
    defaultValues: {
      vendor_id: "",
      email: "",
      name: "",
      ...defaultValues,
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values)
  })

  return (
    <form
      id={CREATE_VENDOR_USER_FORM_ID}
      onSubmit={submit}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <TextField
        id="create-vendor-user-email"
        label="Email"
        type="email"
        error={errors.email?.message}
        disabled={isDisabled || isLoading}
        {...register("email")}
      />
      <TextField
        id="create-vendor-user-name"
        label="Name"
        optional
        error={errors.name?.message}
        disabled={isDisabled || isLoading}
        {...register("name")}
      />
    </form>
  )
}
