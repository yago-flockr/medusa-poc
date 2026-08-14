import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { Button, Drawer, Heading } from "@medusajs/ui"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import type { Brand } from "../../api/admin/brands/contract"
import { SelectField } from "./fields/select-field"
import type { CommonFormProps } from "./form-type"

const NO_BRAND_VALUE = "none"

export const productBrandSchema = z.object({
  brand_id: z.string().nullable(),
})

export type ProductBrand = z.infer<typeof productBrandSchema>

export type ProductBrandFormProps = CommonFormProps<ProductBrand> & {
  brands: Brand[]
}

export const ProductBrandForm = ({
  defaultValues,
  brands,
  isDisabled,
  isLoading,
  onCancel,
  onSubmit,
}: ProductBrandFormProps) => {
  const { control, handleSubmit, reset } = useForm<ProductBrand>({
    resolver: zodResolver(productBrandSchema),
    defaultValues: {
      brand_id: null,
      ...defaultValues,
    },
  })

  useEffect(() => {
    reset({ brand_id: defaultValues?.brand_id ?? null })
  }, [defaultValues?.brand_id, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values)
  })

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
      <Drawer.Header>
        <Heading>Edit Brand</Heading>
      </Drawer.Header>
      <Drawer.Body className="flex flex-1 flex-col gap-y-8 overflow-y-auto">
        <Controller
          control={control}
          name="brand_id"
          render={({ field }) => (
            <SelectField
              id="product-brand"
              label="Brand"
              placeholder="Select a brand"
              disabled={isDisabled || isLoading}
              value={field.value ?? NO_BRAND_VALUE}
              onValueChange={(value) =>
                field.onChange(value === NO_BRAND_VALUE ? null : value)
              }
              options={[
                { label: "No brand", value: NO_BRAND_VALUE },
                ...brands.map((brand) => ({
                  label: brand.name,
                  value: brand.id,
                })),
              ]}
            />
          )}
        />
      </Drawer.Body>
      <Drawer.Footer>
        <div className="flex items-center justify-end gap-x-2">
          <Button
            size="small"
            variant="secondary"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="small"
            type="submit"
            isLoading={isLoading}
            disabled={isDisabled}
          >
            Save
          </Button>
        </div>
      </Drawer.Footer>
    </form>
  )
}
