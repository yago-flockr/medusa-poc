"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { CreateVendorProduct } from "@dtc/api-contracts/vendor/products"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TextField } from "./fields/text-field"
import { NumberFieldControl } from "./fields/number-field-control"
import type { CommonFormProps } from "./form-type"

const createProductFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  subtitle: z.string().trim().optional(),
  description: z.string().trim().optional(),
  handle: z.string().trim().optional(),
  images: z.custom<FileList>().optional(),
  price: z
    .number({ error: "Price is required" })
    .positive("Price must be greater than 0"),
  sku: z.string().trim().optional(),
  barcode: z.string().trim().optional(),
  weight: z.number().positive().optional(),
  length: z.number().positive().optional(),
  height: z.number().positive().optional(),
  width: z.number().positive().optional(),
})

export type CreateProductFormValues = z.infer<typeof createProductFormSchema>

const orUndefined = (value: string | undefined) =>
  value && value.length > 0 ? value : undefined

export function createProductFormToInput(
  values: CreateProductFormValues,
  uploadedImages: { url: string }[],
): CreateVendorProduct {
  return {
    title: values.title,
    subtitle: orUndefined(values.subtitle),
    description: orUndefined(values.description),
    handle: orUndefined(values.handle),
    images: uploadedImages.length
      ? uploadedImages.map((image) => ({ url: image.url }))
      : undefined,
    variants: [
      {
        optionValues: {},
        price: values.price,
        sku: orUndefined(values.sku),
        barcode: orUndefined(values.barcode),
        weight: values.weight,
        length: values.length,
        height: values.height,
        width: values.width,
      },
    ],
  }
}

type CreateProductFormProps = CommonFormProps<CreateProductFormValues> & {
  error?: string
  className?: string
}

export function CreateProductForm({
  isLoading,
  onSubmit,
  error,
  className,
}: CreateProductFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
  })

  const submit = handleSubmit((values) => onSubmit(values))

  return (
    <form onSubmit={submit} className={cn("flex flex-col gap-4", className)}>
      <TextField
        id="create-product-title"
        label="Title"
        error={errors.title?.message}
        {...register("title")}
      />
      <TextField
        id="create-product-subtitle"
        label="Subtitle"
        error={errors.subtitle?.message}
        {...register("subtitle")}
      />
      <TextField
        id="create-product-description"
        label="Description"
        error={errors.description?.message}
        {...register("description")}
      />
      <TextField
        id="create-product-handle"
        label="Handle"
        placeholder="auto-generated from title if left blank"
        error={errors.handle?.message}
        {...register("handle")}
      />
      <TextField
        id="create-product-images"
        label="Images"
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        error={errors.images?.message as string | undefined}
        {...register("images")}
      />
      <Controller
        name="price"
        control={control}
        render={({ field }) => (
          <NumberFieldControl
            id="create-product-price"
            label="Price"
            min={0}
            step={0.01}
            value={field.value}
            onValueChange={(value) => field.onChange(value ?? undefined)}
            error={errors.price?.message}
          />
        )}
      />
      <TextField
        id="create-product-sku"
        label="SKU"
        error={errors.sku?.message}
        {...register("sku")}
      />
      <TextField
        id="create-product-barcode"
        label="Barcode"
        error={errors.barcode?.message}
        {...register("barcode")}
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Controller
          name="weight"
          control={control}
          render={({ field }) => (
            <NumberFieldControl
              id="create-product-weight"
              label="Weight"
              min={0}
              value={field.value}
              onValueChange={(value) => field.onChange(value ?? undefined)}
              error={errors.weight?.message}
            />
          )}
        />
        <Controller
          name="length"
          control={control}
          render={({ field }) => (
            <NumberFieldControl
              id="create-product-length"
              label="Length"
              min={0}
              value={field.value}
              onValueChange={(value) => field.onChange(value ?? undefined)}
              error={errors.length?.message}
            />
          )}
        />
        <Controller
          name="height"
          control={control}
          render={({ field }) => (
            <NumberFieldControl
              id="create-product-height"
              label="Height"
              min={0}
              value={field.value}
              onValueChange={(value) => field.onChange(value ?? undefined)}
              error={errors.height?.message}
            />
          )}
        />
        <Controller
          name="width"
          control={control}
          render={({ field }) => (
            <NumberFieldControl
              id="create-product-width"
              label="Width"
              min={0}
              value={field.value}
              onValueChange={(value) => field.onChange(value ?? undefined)}
              error={errors.width?.message}
            />
          )}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating…" : "Create"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
