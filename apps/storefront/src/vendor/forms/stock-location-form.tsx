"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PostVendorsStockLocationsInput } from "@dtc/api-contracts/vendor/stock-locations"
import type { VendorStockLocation } from "@dtc/api-contracts/vendor/stock-locations"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import {
  RadioGroupField,
  type RadioGroupFieldOption,
} from "./fields/radio-group-field"
import { TextField } from "./fields/text-field"
import type { CommonFormProps } from "./form-type"

export const stockLocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address_1: z.string().min(1, "Address is required"),
  address_2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country_code: z
    .string()
    .min(2, "Use a two-letter country code")
    .max(2, "Use a two-letter country code"),
  phone: z.string().optional(),
})

export type StockLocationSchema = z.infer<typeof stockLocationSchema>

type StockLocationFormProps = CommonFormProps<StockLocationSchema> & {
  countryOptions: RadioGroupFieldOption[]
}

export function stockLocationFormToInput(
  values: StockLocationSchema,
): PostVendorsStockLocationsInput {
  return {
    name: values.name,
    address: {
      address_1: values.address_1,
      address_2: values.address_2 || undefined,
      city: values.city,
      province: values.province,
      postal_code: values.postal_code,
      country_code: values.country_code,
      phone: values.phone || undefined,
    },
  }
}

export function stockLocationInputToForm(
  location: VendorStockLocation,
): StockLocationSchema {
  return {
    name: location.name,
    address_1: location.address?.address_1 ?? "",
    address_2: location.address?.address_2 ?? "",
    city: location.address?.city ?? "",
    province: location.address?.province ?? "",
    postal_code: location.address?.postal_code ?? "",
    country_code: location.address?.country_code ?? "",
    phone: location.address?.phone ?? "",
  }
}

export function StockLocationForm({
  defaultValues,
  isLoading,
  onSubmit,
  className,
  countryOptions,
  ...props
}: StockLocationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StockLocationSchema>({
    resolver: zodResolver(stockLocationSchema),
    defaultValues: {
      name: "",
      address_1: "",
      address_2: "",
      city: "",
      province: "",
      postal_code: "",
      country_code: "",
      phone: "",
      ...defaultValues,
    },
  })

  return (
    <form
      onSubmit={handleSubmit(
        (values) => onSubmit?.(values),
        (formErrors) => console.error("Form validation failed:", formErrors),
      )}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <TextField
        id="location-name"
        label="Name"
        error={errors.name?.message}
        {...register("name")}
      />
      <TextField
        id="location-address-1"
        label="Address"
        error={errors.address_1?.message}
        {...register("address_1")}
      />
      <TextField
        id="location-address-2"
        label="Address line 2"
        error={errors.address_2?.message}
        {...register("address_2")}
      />
      <TextField
        id="location-city"
        label="City"
        error={errors.city?.message}
        {...register("city")}
      />
      <TextField
        id="location-province"
        label="Province"
        error={errors.province?.message}
        {...register("province")}
      />
      <TextField
        id="location-postal-code"
        label="Postal code"
        error={errors.postal_code?.message}
        {...register("postal_code")}
      />
      <Controller
        name="country_code"
        control={control}
        render={({ field }) => (
          <RadioGroupField
            label="Country"
            value={field.value}
            onValueChange={field.onChange}
            options={countryOptions}
            error={errors.country_code?.message}
          />
        )}
      />
      <TextField
        id="location-phone"
        label="Phone"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving…" : "Save"}
      </Button>
    </form>
  )
}
