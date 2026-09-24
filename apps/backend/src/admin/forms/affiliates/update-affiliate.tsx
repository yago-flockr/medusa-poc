import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { useForm } from "react-hook-form"
import {
  updateAffiliateSchema,
  type UpdateAffiliate,
} from "@dtc/api-contracts/admin/affiliates"
import { Divider } from "../../components/divider"
import { TextField } from "../fields/text-field"
import { TextareaField } from "../fields/textarea-field"
import type { CommonFormProps } from "../form-type"

export const UPDATE_AFFILIATE_FORM_ID = "update-affiliate-form"

export type UpdateAffiliateFormProps = CommonFormProps<UpdateAffiliate>

export const UpdateAffiliateForm = ({
  defaultValues,
  isDisabled,
  isLoading,
  onSubmit,
}: UpdateAffiliateFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof updateAffiliateSchema>, unknown, UpdateAffiliate>({
    resolver: zodResolver(updateAffiliateSchema),
    defaultValues,
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values)
  })

  return (
    <form
      id={UPDATE_AFFILIATE_FORM_ID}
      onSubmit={submit}
      className="flex flex-col gap-4"
    >
      <TextField
        id="update-affiliate-name"
        label="Name"
        error={errors.name?.message}
        disabled={isDisabled || isLoading}
        {...register("name")}
      />
      <TextField
        id="update-affiliate-handle"
        label="Handle"
        error={errors.handle?.message}
        disabled={isDisabled || isLoading}
        {...register("handle")}
      />
      <TextField
        id="update-affiliate-commission-rate"
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
        id="update-affiliate-storefront-name"
        label="Name"
        optional
        error={errors.storefront_content?.name?.message}
        disabled={isDisabled || isLoading}
        {...register("storefront_content.name")}
      />
      <TextareaField
        id="update-affiliate-storefront-description"
        label="Description"
        optional
        error={errors.storefront_content?.description?.message}
        disabled={isDisabled || isLoading}
        {...register("storefront_content.description")}
      />
      <TextField
        id="update-affiliate-storefront-hero-image-url"
        label="Image URL"
        optional
        error={errors.storefront_content?.hero_image_url?.message}
        disabled={isDisabled || isLoading}
        {...register("storefront_content.hero_image_url")}
      />
    </form>
  )
}
