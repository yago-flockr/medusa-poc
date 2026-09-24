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
    name: vendorUser.name ?? undefined,
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
      name: "",
      ...defaultValues,
    },
  })

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
    })
  }, [defaultValues?.name, reset])

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
        id="update-vendor-user-name"
        label="Name"
        optional
        error={errors.name?.message}
        disabled={isDisabled || isLoading}
        {...register("name")}
      />
    </form>
  )
}
