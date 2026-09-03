"use client"

import { Button } from "@/components/ui/button"
import { cartesian } from "@/lib/cartesian"
import { cn } from "@/lib/utils"
import type { PostVendorsProductsInput } from "@dtc/api-contracts/vendor/products"
import { uniq } from "lodash"
import { useMemo, useState, type FormEvent } from "react"
import z from "zod"
import { FieldArray } from "./fields/field-array"
import { ImagesField } from "./fields/images-field"
import {
  ProductVariantFieldsCard,
  type ProductVariantFieldsValue,
} from "./fields/product-variant-fields-card"
import { TextField } from "./fields/text-field"
import { TextareaField } from "./fields/textarea-field"
import type { CommonFormProps } from "./form-type"

const MAX_OPTIONS = 5
const MAX_VARIANTS = 50
const MAX_IMAGES = 5

export const productFormOptionSchema = z.object({
  title: z.string().trim().min(1, "Option name is required"),
  values: z.array(z.string().trim().min(1)).min(1, "Add at least one value"),
})

export const productFormVariantSchema = z.object({
  optionValues: z.record(z.string(), z.string()),
  price: z.number().positive("Price must be greater than 0"),
  sku: z.string().trim().min(1).optional(),
  weight: z.number().positive().optional(),
})

export const productFormSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    subtitle: z.string().trim().optional(),
    description: z.string().trim().optional(),
    handle: z.string().trim().optional(),
    images: z.array(z.string()).max(MAX_IMAGES, "Up to 5 images"),
    options: z.array(productFormOptionSchema).max(MAX_OPTIONS).optional(),
    variants: z
      .array(productFormVariantSchema)
      .min(1, "At least one variant is required")
      .max(MAX_VARIANTS),
  })
  .refine(
    (data) => {
      const titles = (data.options ?? []).map((option) =>
        option.title.trim().toLowerCase(),
      )
      return uniq(titles).length === titles.length
    },
    { message: "Option names must be unique", path: ["options"] },
  )

export type ProductFormSchema = z.infer<typeof productFormSchema>
type ProductFormOption = z.infer<typeof productFormOptionSchema>

type ProductFormProps = CommonFormProps<ProductFormSchema> & {
  onUploadImages: (files: File[]) => Promise<string[]>
  isUploadingImages?: boolean
}

export function productFormToInput(
  values: ProductFormSchema,
): PostVendorsProductsInput {
  return {
    title: values.title,
    subtitle: values.subtitle || undefined,
    description: values.description || undefined,
    handle: values.handle || undefined,
    images: values.images.map((url) => ({ url })),
    options: values.options,
    variants: values.variants,
  }
}

function optionCombinations(
  options: ProductFormOption[],
): Record<string, string>[] {
  return cartesian(
    Object.fromEntries(options.map((option) => [option.title, option.values])),
  )
}

function comboKey(combo: Record<string, string>) {
  return Object.values(combo).join(" / ")
}

type OptionsSectionProps = {
  options: ProductFormOption[]
  onAdd: () => void
  onRemove: (index: number) => void
  onTitleChange: (index: number, value: string) => void
  onValuesChange: (index: number, valuesText: string) => void
}

function OptionsSection({
  options,
  onAdd,
  onRemove,
  onTitleChange,
  onValuesChange,
}: OptionsSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Options</p>
      <FieldArray
        label="Option"
        values={options}
        disableAdd={options.length >= MAX_OPTIONS}
        onAdd={onAdd}
        onRemove={onRemove}
      >
        {(index) => (
          <>
            <TextField
              id={`option-title-${index}`}
              label="Option name"
              placeholder="e.g. Size"
              value={options[index].title}
              onChange={(event) => onTitleChange(index, event.target.value)}
            />
            <TextField
              id={`option-values-${index}`}
              label="Values (comma-separated)"
              placeholder="e.g. S, M, L"
              defaultValue={options[index].values.join(", ")}
              onBlur={(event) => onValuesChange(index, event.target.value)}
            />
          </>
        )}
      </FieldArray>
    </div>
  )
}

type VariantsSectionProps = {
  combos: Record<string, string>[]
  tooManyVariants: boolean
  variantFields: Record<string, ProductVariantFieldsValue>
  onVariantFieldChange: (
    key: string,
    field: keyof ProductVariantFieldsValue,
    value: string,
  ) => void
}

function VariantsSection({
  combos,
  tooManyVariants,
  variantFields,
  onVariantFieldChange,
}: VariantsSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Variants</p>
      {tooManyVariants ? (
        <p className="text-sm text-destructive">
          That&apos;s {combos.length} variants — reduce option values to 50 or
          fewer combinations.
        </p>
      ) : (
        (combos.length > 0 ? combos : [{}]).map((combo) => {
          const key = comboKey(combo)
          const fields = variantFields[key] ?? {
            price: "",
            sku: "",
            weight: "",
          }

          return (
            <ProductVariantFieldsCard
              key={key || "default"}
              idPrefix={`variant-${key || "default"}`}
              label={key || "Default"}
              value={fields}
              onChange={(field, value) =>
                onVariantFieldChange(key, field, value)
              }
            />
          )
        })
      )}
      <p className="text-xs text-muted-foreground">
        SKU and weight are optional, but a variant missing either stays a
        draft until you fill them in.
      </p>
    </div>
  )
}

export function ProductForm({
  defaultValues,
  isLoading,
  onUploadImages,
  isUploadingImages,
  onSubmit,
  className,
  ...props
}: ProductFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? "")
  const [subtitle, setSubtitle] = useState(defaultValues?.subtitle ?? "")
  const [description, setDescription] = useState(
    defaultValues?.description ?? "",
  )
  const [handle, setHandle] = useState(defaultValues?.handle ?? "")
  const [images, setImages] = useState<string[]>(defaultValues?.images ?? [])

  const [options, setOptions] = useState<ProductFormOption[]>([])
  const [variantFields, setVariantFields] = useState<
    Record<string, ProductVariantFieldsValue>
  >({})
  const [error, setError] = useState<string>()

  const combos = useMemo(() => optionCombinations(options), [options])
  const tooManyVariants = combos.length > MAX_VARIANTS

  function addOption() {
    if (options.length >= MAX_OPTIONS) return
    setOptions((current) => [...current, { title: "", values: [] }])
  }

  function updateOptionTitle(index: number, value: string) {
    setOptions((current) =>
      current.map((option, i) =>
        i === index ? { ...option, title: value } : option,
      ),
    )
  }

  function updateOptionValues(index: number, valuesText: string) {
    const values = valuesText
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)

    setOptions((current) =>
      current.map((option, i) => (i === index ? { ...option, values } : option)),
    )
  }

  function removeOption(index: number) {
    setOptions((current) => current.filter((_, i) => i !== index))
  }

  function updateVariantField(
    key: string,
    field: keyof ProductVariantFieldsValue,
    value: string,
  ) {
    setVariantFields((current) => ({
      ...current,
      [key]: { ...current[key], [field]: value },
    }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const variants = (combos.length > 0 ? combos : [{}]).map((combo) => {
      const key = comboKey(combo)
      const fields = variantFields[key] ?? { price: "", sku: "", weight: "" }

      return {
        optionValues: combo,
        price: Number(fields.price),
        sku: fields.sku.trim() || undefined,
        weight: fields.weight.trim() ? Number(fields.weight) : undefined,
      }
    })

    const result = productFormSchema.safeParse({
      title,
      subtitle,
      description,
      handle,
      images,
      options: options.length > 0 ? options : undefined,
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
      <TextField
        id="product-title"
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <TextField
        id="product-subtitle"
        label="Subtitle"
        value={subtitle}
        onChange={(event) => setSubtitle(event.target.value)}
      />
      <TextareaField
        id="product-description"
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <TextField
        id="product-handle"
        label="Handle"
        placeholder="Auto-generated from title if left blank"
        value={handle}
        onChange={(event) => setHandle(event.target.value)}
      />

      <ImagesField
        images={images}
        onChange={setImages}
        onUploadImages={onUploadImages}
        isUploadingImages={isUploadingImages}
      />

      <OptionsSection
        options={options}
        onAdd={addOption}
        onRemove={removeOption}
        onTitleChange={updateOptionTitle}
        onValuesChange={updateOptionValues}
      />

      <VariantsSection
        combos={combos}
        tooManyVariants={tooManyVariants}
        variantFields={variantFields}
        onVariantFieldChange={updateVariantField}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isLoading || tooManyVariants}>
        {isLoading ? "Saving…" : "Save"}
      </Button>
    </form>
  )
}
