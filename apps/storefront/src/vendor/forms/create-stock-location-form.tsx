"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { CreateVendorStockLocation } from "@dtc/api-contracts/vendor/stock-locations"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TextField } from "./fields/text-field"
import type { CommonFormProps } from "./form-type"

const createStockLocationFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    address_1: z.string().trim().optional(),
    address_2: z.string().trim().optional(),
    city: z.string().trim().optional(),
    province: z.string().trim().optional(),
    postal_code: z.string().trim().optional(),
    country_code: z.string().trim().optional(),
    phone: z.string().trim().optional(),
  })
  .refine(
    (data) => !data.address_1 || (data.country_code && data.country_code.length === 2),
    {
      message: "A two-letter country code is required once an address is entered",
      path: ["country_code"],
    },
  )

export type CreateStockLocationFormValues = z.infer<
  typeof createStockLocationFormSchema
>

const orUndefined = (value: string | undefined) =>
  value && value.length > 0 ? value : undefined

export function createStockLocationFormToInput(
  values: CreateStockLocationFormValues,
): CreateVendorStockLocation {
  return {
    name: values.name,
    address: values.address_1
      ? {
          address_1: values.address_1,
          address_2: orUndefined(values.address_2),
          city: orUndefined(values.city),
          province: orUndefined(values.province),
          postal_code: orUndefined(values.postal_code),
          country_code: values.country_code!,
          phone: orUndefined(values.phone),
        }
      : undefined,
  }
}

type CreateStockLocationFormProps =
  CommonFormProps<CreateStockLocationFormValues> & {
    error?: string
    className?: string
  }

export function CreateStockLocationForm({
  isLoading,
  onSubmit,
  error,
  className,
}: CreateStockLocationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStockLocationFormValues>({
    resolver: zodResolver(createStockLocationFormSchema),
  })

  const submit = handleSubmit((values) => onSubmit(values))

  return (
    <form onSubmit={submit} className={cn("flex flex-col gap-4", className)}>
      <TextField
        id="create-stock-location-name"
        label="Name"
        placeholder="Main warehouse"
        error={errors.name?.message}
        {...register("name")}
      />
      <TextField
        id="create-stock-location-address-1"
        label="Address"
        error={errors.address_1?.message}
        {...register("address_1")}
      />
      <TextField
        id="create-stock-location-address-2"
        label="Address line 2"
        error={errors.address_2?.message}
        {...register("address_2")}
      />
      <div className="grid grid-cols-2 gap-4">
        <TextField
          id="create-stock-location-city"
          label="City"
          error={errors.city?.message}
          {...register("city")}
        />
        <TextField
          id="create-stock-location-province"
          label="Province"
          error={errors.province?.message}
          {...register("province")}
        />
        <TextField
          id="create-stock-location-postal-code"
          label="Postal code"
          error={errors.postal_code?.message}
          {...register("postal_code")}
        />
        <TextField
          id="create-stock-location-country-code"
          label="Country code"
          placeholder="US"
          error={errors.country_code?.message}
          {...register("country_code")}
        />
      </div>
      <TextField
        id="create-stock-location-phone"
        label="Phone"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating…" : "Create"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
