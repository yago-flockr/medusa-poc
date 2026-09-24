import type { Vendor } from "@dtc/api-contracts/admin/vendors"
import { commissionRateSchema } from "@dtc/api-contracts/common/commission-rate"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Divider } from "../../components/divider"
import { TextField } from "../fields/text-field"
import { TextareaField } from "../fields/textarea-field"
import type { CommonFormProps } from "../form-type"

export const UPDATE_VENDOR_FORM_ID = "update-vendor-form"

const updateVendorFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  handle: z.string().trim().min(1, "Handle is required"),
  commission_rate: commissionRateSchema,
  storefront_content: z.object({
    name: z.string().trim().optional(),
    description: z.string().trim().optional(),
    hero_image_url: z.string().trim().optional(),
  }),
})

export type UpdateVendorFormValues = z.infer<typeof updateVendorFormSchema>
export type UpdateVendorFormProps = CommonFormProps<UpdateVendorFormValues>

function defaultValuesFromVendor(vendor?: Vendor): UpdateVendorFormValues {
  return {
    name: vendor?.name ?? "",
    handle: vendor?.handle ?? "",
    commission_rate: vendor?.commission_rate ?? 0,
    storefront_content: {
      name: vendor?.storefront_content?.name ?? "",
      description: vendor?.storefront_content?.description ?? "",
      hero_image_url: vendor?.storefront_content?.hero_image_url ?? "",
    },
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
      <TextField
        id="update-vendor-commission-rate"
        label="Commission rate"
        type="number"
        step="0.01"
        min="0"
        max="1"
        error={errors.commission_rate?.message}
        disabled={isDisabled || isLoading}
        {...register("commission_rate", { valueAsNumber: true })}
      />
      <Divider>Storefront Content</Divider>
      <TextField
        id="update-vendor-storefront-name"
        label="Name"
        optional
        error={errors.storefront_content?.name?.message}
        disabled={isDisabled || isLoading}
        {...register("storefront_content.name")}
      />
      <TextareaField
        id="update-vendor-storefront-description"
        label="Description"
        optional
        error={errors.storefront_content?.description?.message}
        disabled={isDisabled || isLoading}
        {...register("storefront_content.description")}
      />
      <TextField
        id="update-vendor-storefront-hero-image-url"
        label="Image URL"
        optional
        error={errors.storefront_content?.hero_image_url?.message}
        disabled={isDisabled || isLoading}
        {...register("storefront_content.hero_image_url")}
      />
    </form>
  )
}
