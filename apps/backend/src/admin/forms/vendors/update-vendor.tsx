import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import type { Vendor } from "@dtc/api-contracts/admin/vendors"
import { vendorIntegrationConnectionProviderSchema } from "@dtc/api-contracts/admin/vendors"
import { Divider } from "../../components/divider"
import { SelectField, type SelectFieldOption } from "../fields/select-field"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export const UPDATE_VENDOR_FORM_ID = "update-vendor-form"

const PROVIDER_OPTIONS: SelectFieldOption[] = vendorIntegrationConnectionProviderSchema.options.map(
  (provider) => ({ label: provider, value: provider }),
)

const updateVendorFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  handle: z.string().trim().min(1, "Handle is required"),
  integration_connection: z.object({
    provider: z.enum(vendorIntegrationConnectionProviderSchema.options),
    external_account_identifier: z
      .string()
      .trim()
      .refine(
        (value) => !value.includes("://"),
        "Enter just the domain or URL, without https:// (e.g. your-store.myshopify.com)",
      ),
    client_id: z.string().trim(),
    client_secret: z.string().trim(),
  }),
})

export type UpdateVendorFormValues = z.infer<typeof updateVendorFormSchema>
export type UpdateVendorFormProps = CommonFormProps<UpdateVendorFormValues>

function defaultValuesFromVendor(vendor?: Vendor): UpdateVendorFormValues {
  const existingConnection = vendor?.integration_connections?.[0]
  const provider = existingConnection?.provider ?? vendorIntegrationConnectionProviderSchema.options[0]

  return {
    name: vendor?.name ?? "",
    handle: vendor?.handle ?? "",
    integration_connection: {
      provider,
      external_account_identifier: existingConnection?.external_account_identifier ?? "",
      client_id: existingConnection?.client_id ?? "",
      client_secret: "",
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
    control,
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
      <Divider>Integration connection</Divider>
      <Controller
        control={control}
        name="integration_connection.provider"
        render={({ field }) => (
          <SelectField
            id="update-vendor-connection-provider"
            label="Provider"
            options={PROVIDER_OPTIONS}
            error={errors.integration_connection?.provider?.message}
            disabled={isDisabled || isLoading}
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
      <TextField
        id="update-vendor-connection-store-domain"
        label="Store Domain / URL"
        optional
        placeholder="their-store.myshopify.com"
        error={errors.integration_connection?.external_account_identifier?.message}
        disabled={isDisabled || isLoading}
        {...register("integration_connection.external_account_identifier")}
      />
      <TextField
        id="update-vendor-connection-client-id"
        label="Client ID"
        optional
        error={errors.integration_connection?.client_id?.message}
        disabled={isDisabled || isLoading}
        {...register("integration_connection.client_id")}
      />
      <TextField
        id="update-vendor-connection-client-secret"
        label="Client Secret"
        optional
        type="password"
        placeholder="Leave blank to keep the current secret"
        error={errors.integration_connection?.client_secret?.message}
        disabled={isDisabled || isLoading}
        {...register("integration_connection.client_secret")}
      />
    </form>
  )
}
