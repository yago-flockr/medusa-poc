import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { Vendor } from "../../../api/admin/vendors/contract"
import { Divider } from "../../components/divider"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export const UPDATE_VENDOR_FORM_ID = "update-vendor-form"

const updateVendorFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  handle: z.string().trim().min(1, "Handle is required"),
  shopify_store_domain: z
    .string()
    .trim()
    .refine(
      (value) => !value.includes("://"),
      "Enter just the domain, without https:// (e.g. your-store.myshopify.com)",
    ),
  shopify_client_id: z.string().trim(),
  shopify_client_secret: z.string().trim(),
})

export type UpdateVendorFormValues = z.infer<typeof updateVendorFormSchema>
export type UpdateVendorFormProps = CommonFormProps<UpdateVendorFormValues>

export function vendorToForm(vendor: Vendor): UpdateVendorFormValues {
  return {
    name: vendor.name,
    handle: vendor.handle,
    shopify_store_domain: vendor.shopify_store_domain ?? "",
    shopify_client_id: vendor.shopify_client_id ?? "",
    shopify_client_secret: "",
  }
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
    defaultValues: {
      name: "",
      handle: "",
      shopify_store_domain: "",
      shopify_client_id: "",
      shopify_client_secret: "",
      ...defaultValues,
    },
  })

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
      handle: defaultValues?.handle ?? "",
      shopify_store_domain: defaultValues?.shopify_store_domain ?? "",
      shopify_client_id: defaultValues?.shopify_client_id ?? "",
      shopify_client_secret: "",
    })
  }, [
    defaultValues?.name,
    defaultValues?.handle,
    defaultValues?.shopify_store_domain,
    defaultValues?.shopify_client_id,
    reset,
  ])

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
      <Divider>Shopify</Divider>
      <TextField
        id="update-vendor-shopify-store-domain"
        label="Store Domain"
        optional
        placeholder="their-store.myshopify.com"
        error={errors.shopify_store_domain?.message}
        disabled={isDisabled || isLoading}
        {...register("shopify_store_domain")}
      />
      <TextField
        id="update-vendor-shopify-client-id"
        label="Client ID"
        optional
        error={errors.shopify_client_id?.message}
        disabled={isDisabled || isLoading}
        {...register("shopify_client_id")}
      />
      <TextField
        id="update-vendor-shopify-client-secret"
        label="Client Secret"
        optional
        type="password"
        placeholder="Leave blank to keep the current secret"
        error={errors.shopify_client_secret?.message}
        disabled={isDisabled || isLoading}
        {...register("shopify_client_secret")}
      />
    </form>
  )
}
