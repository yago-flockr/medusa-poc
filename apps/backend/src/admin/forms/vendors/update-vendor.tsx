import type { Vendor } from "@dtc/api-contracts/admin/vendors"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export const UPDATE_VENDOR_FORM_ID = "update-vendor-form"

const updateVendorFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  handle: z.string().trim().min(1, "Handle is required"),
})

export type UpdateVendorFormValues = z.infer<typeof updateVendorFormSchema>
export type UpdateVendorFormProps = CommonFormProps<UpdateVendorFormValues>

function defaultValuesFromVendor(vendor?: Vendor): UpdateVendorFormValues {
  return {
    name: vendor?.name ?? "",
    handle: vendor?.handle ?? "",
  }
}

export function vendorToForm(vendor: Vendor): UpdateVendorFormValues {
  return defaultValuesFromVendor(vendor)
}

export const UpdateVendorForm = ({
  defaultValues,
  isDisabled,
  isLoading,
  onSubmit,
}: UpdateVendorFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateVendorFormValues>({
    resolver: zodResolver(updateVendorFormSchema),
    defaultValues: defaultValuesFromVendor(),
  })

  useEffect(() => {
    reset(defaultValues ?? defaultValuesFromVendor())
  }, [defaultValues, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values)
  })

  return (
    <form
      id={UPDATE_VENDOR_FORM_ID}
      onSubmit={submit}
      className="grid grid-cols-1 gap-4"
    >
      <TextField
        id="update-vendor-name"
        label="Name"
        error={errors.name?.message}
        disabled={isDisabled || isLoading}
        {...register("name")}
      />
      <TextField
        id="update-vendor-handle"
        label="Handle"
        placeholder="acme"
        error={errors.handle?.message}
        disabled={isDisabled || isLoading}
        {...register("handle")}
      />
    </form>
  )
}
