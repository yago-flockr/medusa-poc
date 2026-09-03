"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import type {
  PostVendorsProductsByIdInput,
  VendorProductDetail,
  VendorProductStatus,
} from "@dtc/api-contracts/vendor/products"
import { vendorProductStatusSchema } from "@dtc/api-contracts/vendor/products"
import { keyBy, mapValues } from "lodash"
import { useState, type FormEvent } from "react"
import z from "zod"
import { ImagesField } from "./fields/images-field"
import {
  ProductVariantFieldsCard,
  type ProductVariantFieldsValue,
} from "./fields/product-variant-fields-card"
import { TextField } from "./fields/text-field"
import { TextareaField } from "./fields/textarea-field"
import type { CommonFormProps } from "./form-type"

const MAX_IMAGES = 5

// Rejected is a system/staff-only classification for products that can't be
// completed (e.g. incomplete external data) — not a state a vendor sets on
// their own product, so it's left out of the vendor-facing options.
const VENDOR_SETTABLE_STATUSES = ["draft", "proposed", "published"] as const

export const productEditVariantSchema = z.object({
  id: z.string(),
  price: z.number().positive("Price must be greater than 0").optional(),
  sku: z.string().trim().min(1).optional(),
  weight: z.number().positive().optional(),
})

export const productEditSchema = z.object({
  title: z.string().trim().min(1, "Title is required").optional(),
  subtitle: z.string().trim().optional(),
  description: z.string().trim().optional(),
  handle: z.string().trim().optional(),
  images: z.array(z.string()).max(MAX_IMAGES, "Up to 5 images").optional(),
  status: vendorProductStatusSchema,
  variants: z.array(productEditVariantSchema).optional(),
})

export type ProductEditSchema = z.infer<typeof productEditSchema>

type ProductEditFormProps = CommonFormProps<ProductEditSchema> & {
  product: VendorProductDetail
  onUploadImages: (files: File[]) => Promise<string[]>
  isUploadingImages?: boolean
}

export function productEditFormToInput(
  values: ProductEditSchema,
  isExternal: boolean,
): PostVendorsProductsByIdInput {
  if (isExternal) {
    return { status: values.status }
  }

  return {
    title: values.title,
    subtitle: values.subtitle || undefined,
    description: values.description || undefined,
    handle: values.handle || undefined,
    images: values.images?.map((url) => ({ url })),
    status: values.status,
    variants: values.variants,
  }
}

function StatusField({
  value,
  onChange,
}: {
  value: VendorProductStatus
  onChange: (value: VendorProductStatus) => void
}) {
  const isSettable = VENDOR_SETTABLE_STATUSES.includes(
    value as (typeof VENDOR_SETTABLE_STATUSES)[number],
  )

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Status</p>
      {!isSettable && (
        <Badge variant="muted" className="w-fit">
          Current: {value}
        </Badge>
      )}
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as VendorProductStatus)}
        className="flex-row gap-4"
      >
        {VENDOR_SETTABLE_STATUSES.map((status) => (
          <Label key={status} className="flex items-center gap-2 capitalize">
            <RadioGroupItem value={status} />
            {status}
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}

type VariantsSectionProps = {
  variants: VendorProductDetail["variants"]
  variantFields: Record<string, ProductVariantFieldsValue>
  onVariantFieldChange: (
    id: string,
    field: keyof ProductVariantFieldsValue,
    value: string,
  ) => void
}

function VariantsSection({
  variants,
  variantFields,
  onVariantFieldChange,
}: VariantsSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Variants</p>
      {variants.map((variant) => (
        <ProductVariantFieldsCard
          key={variant.id}
          idPrefix={`variant-edit-${variant.id}`}
          label={variant.title}
          value={variantFields[variant.id]}
          onChange={(field, value) =>
            onVariantFieldChange(variant.id, field, value)
          }
        />
      ))}
    </div>
  )
}

export function ProductEditForm({
  product,
  isLoading,
  onUploadImages,
  isUploadingImages,
  onSubmit,
  className,
  ...props
}: ProductEditFormProps) {
  const isExternal = Boolean(product.external_id)

  const [title, setTitle] = useState(product.title)
  const [subtitle, setSubtitle] = useState(product.subtitle ?? "")
  const [description, setDescription] = useState(product.description ?? "")
  const [handle, setHandle] = useState(product.handle ?? "")
  const [images, setImages] = useState<string[]>(product.images)
  const [status, setStatus] = useState(product.status)

  const [variantFields, setVariantFields] = useState<
    Record<string, ProductVariantFieldsValue>
  >(() =>
    mapValues(keyBy(product.variants, "id"), (variant) => ({
      price: variant.price?.toString() ?? "",
      sku: variant.sku ?? "",
      weight: variant.weight?.toString() ?? "",
    })),
  )
  const [error, setError] = useState<string>()

  function updateVariantField(
    id: string,
    field: keyof ProductVariantFieldsValue,
    value: string,
  ) {
    setVariantFields((current) => ({
      ...current,
      [id]: { ...current[id], [field]: value },
    }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const variants = product.variants.map((variant) => {
      const fields = variantFields[variant.id]

      return {
        id: variant.id,
        price: fields.price.trim() ? Number(fields.price) : undefined,
        sku: fields.sku.trim() || undefined,
        weight: fields.weight.trim() ? Number(fields.weight) : undefined,
      }
    })

    const result = productEditSchema.safeParse({
      title,
      subtitle,
      description,
      handle,
      images,
      status,
      variants,
    })

    if (!result.success) {
      setError(result.error.issues[0]?.message)
      return
    }

    setError(undefined)
    onSubmit?.(result.data)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex min-w-0 flex-col gap-4", className)}
      {...props}
    >
      <StatusField value={status} onChange={setStatus} />

      {isExternal && (
        <Alert>
          <AlertTitle>This product is external</AlertTitle>
          <AlertDescription>
            You can&apos;t edit this product because it is managed by an
            external system. You can only change its status.
          </AlertDescription>
        </Alert>
      )}

      <fieldset disabled={isExternal} className="contents">
        <TextField
          id="product-edit-title"
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <TextField
          id="product-edit-subtitle"
          label="Subtitle"
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
        />
        <TextareaField
          id="product-edit-description"
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <TextField
          id="product-edit-handle"
          label="Handle"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
        />

        <ImagesField
          images={images}
          onChange={setImages}
          onUploadImages={onUploadImages}
          isUploadingImages={isUploadingImages}
        />

        <VariantsSection
          variants={product.variants}
          variantFields={variantFields}
          onVariantFieldChange={updateVariantField}
        />
      </fieldset>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving…" : "Save"}
      </Button>
    </form>
  )
}
