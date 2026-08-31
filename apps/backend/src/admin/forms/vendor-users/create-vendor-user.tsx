import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { Controller, useForm } from "react-hook-form"
import {
  createVendorUserSchema,
  type CreateVendorUser,
} from "@dtc/api-contracts/admin/vendor-users"
import { SelectField, type SelectFieldOption } from "../fields/select-field"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export const CREATE_VENDOR_USER_FORM_ID = "create-vendor-user-form"

export type CreateVendorUserFormProps = CommonFormProps<CreateVendorUser> & {
  vendorOptions: SelectFieldOption[]
}

export const CreateVendorUserForm = ({
  defaultValues,
  isDisabled,
  isLoading,
  onSubmit,
  vendorOptions,
}: CreateVendorUserFormProps) => {
  const {
    control,
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
      first_name: "",
      last_name: "",
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
      <Controller
        control={control}
        name="vendor_id"
        render={({ field }) => (
          <SelectField
            id="create-vendor-user-vendor"
            label="Vendor"
            placeholder="Select a vendor"
            options={vendorOptions}
            error={errors.vendor_id?.message}
            disabled={isDisabled || isLoading}
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
      <TextField
        id="create-vendor-user-email"
        label="Email"
        type="email"
        error={errors.email?.message}
        disabled={isDisabled || isLoading}
        {...register("email")}
      />
      <TextField
        id="create-vendor-user-first-name"
        label="First name"
        optional
        error={errors.first_name?.message}
        disabled={isDisabled || isLoading}
        {...register("first_name")}
      />
      <TextField
        id="create-vendor-user-last-name"
        label="Last name"
        optional
        error={errors.last_name?.message}
        disabled={isDisabled || isLoading}
        {...register("last_name")}
      />
    </form>
  )
}
