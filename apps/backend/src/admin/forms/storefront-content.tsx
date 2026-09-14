import {
  updateStorefrontContentSchema,
  type UpdateStorefrontContent,
} from "@dtc/api-contracts/common/storefront-content"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { TextField } from "./fields/text-field"
import { TextareaField } from "./fields/textarea-field"
import type { CommonFormProps } from "./form-type"

export type StorefrontContentFormProps =
  CommonFormProps<UpdateStorefrontContent> & {
    id: string
  }

export const StorefrontContentForm = ({
  id,
  defaultValues,
  isDisabled,
  isLoading,
  onSubmit,
}: StorefrontContentFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateStorefrontContent>({
    resolver: zodResolver(updateStorefrontContentSchema),
    defaultValues: {
      name: "",
      description: "",
      hero_image_url: "",
      ...defaultValues,
    },
  })

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      hero_image_url: defaultValues?.hero_image_url ?? "",
    })
  }, [
    defaultValues?.name,
    defaultValues?.description,
    defaultValues?.hero_image_url,
    reset,
  ])

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values)
  })

  return (
    <form id={id} onSubmit={submit} className="grid grid-cols-1 gap-4">
      <TextField
        id={`${id}-name`}
        label="Name"
        optional
        error={errors.name?.message}
        disabled={isDisabled || isLoading}
        {...register("name")}
      />
      <TextareaField
        id={`${id}-description`}
        label="Description"
        optional
        error={errors.description?.message}
        disabled={isDisabled || isLoading}
        {...register("description")}
      />
      <TextField
        id={`${id}-hero-image-url`}
        label="Image URL"
        optional
        error={errors.hero_image_url?.message}
        disabled={isDisabled || isLoading}
        {...register("hero_image_url")}
      />
    </form>
  )
}
