import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  updateVendorUserSchema,
  type UpdateVendorUser,
  type VendorUser,
} from "@dtc/api-contracts/admin/vendor-users"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export const UPDATE_VENDOR_USER_FORM_ID = "update-vendor-user-form"

export type UpdateVendorUserFormProps = CommonFormProps<UpdateVendorUser>

export function vendorUserToForm(vendorUser: VendorUser): UpdateVendorUser {
  return {
    first_name: vendorUser.first_name ?? undefined,
    last_name: vendorUser.last_name ?? undefined,
  }
}

export const UpdateVendorUserForm = ({
  defaultValues,
  isDisabled,
  isLoading,
  onSubmit,
}: UpdateVendorUserFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<
    z.input<typeof updateVendorUserSchema>,
    unknown,
    UpdateVendorUser
  >({
    resolver: zodResolver(updateVendorUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      ...defaultValues,
    },
  })

  useEffect(() => {
    reset({
      first_name: defaultValues?.first_name ?? "",
      last_name: defaultValues?.last_name ?? "",
    })
  }, [defaultValues?.first_name, defaultValues?.last_name, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values)
  })

  return (
    <form
      id={UPDATE_VENDOR_USER_FORM_ID}
      onSubmit={submit}
      className="grid grid-cols-1 gap-4"
    >
      <TextField
        id="update-vendor-user-first-name"
        label="First name"
        optional
        error={errors.first_name?.message}
        disabled={isDisabled || isLoading}
        {...register("first_name")}
      />
      <TextField
        id="update-vendor-user-last-name"
        label="Last name"
        optional
        error={errors.last_name?.message}
        disabled={isDisabled || isLoading}
        {...register("last_name")}
      />
    </form>
  )
}
