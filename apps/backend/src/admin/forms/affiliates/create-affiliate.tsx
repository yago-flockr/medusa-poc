import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { useForm } from "react-hook-form"
import {
  createAffiliateSchema,
  type CreateAffiliate,
} from "@dtc/api-contracts/admin/affiliates"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export const CREATE_AFFILIATE_FORM_ID = "create-affiliate-form"

export type CreateAffiliateFormProps = CommonFormProps<CreateAffiliate>

export const CreateAffiliateForm = ({
  defaultValues,
  isDisabled,
  isLoading,
  onSubmit,
}: CreateAffiliateFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof createAffiliateSchema>, unknown, CreateAffiliate>({
    resolver: zodResolver(createAffiliateSchema),
    defaultValues: {
      name: "",
      email: "",
      handle: "",
      commission_rate: 0.1,
      ...defaultValues,
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values)
  })

  return (
    <form
      id={CREATE_AFFILIATE_FORM_ID}
      onSubmit={submit}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <TextField
        id="create-affiliate-name"
        label="Name"
        error={errors.name?.message}
        disabled={isDisabled || isLoading}
        {...register("name")}
      />
      <TextField
        id="create-affiliate-email"
        label="Email"
        type="email"
        error={errors.email?.message}
        disabled={isDisabled || isLoading}
        {...register("email")}
      />
      <TextField
        id="create-affiliate-handle"
        label="Handle"
        optional
        error={errors.handle?.message}
        disabled={isDisabled || isLoading}
        {...register("handle")}
      />
      <TextField
        id="create-affiliate-commission-rate"
        label="Commission rate"
        type="number"
        step="0.01"
        min="0"
        max="1"
        error={errors.commission_rate?.message}
        disabled={isDisabled || isLoading}
        {...register("commission_rate", { valueAsNumber: true })}
      />
    </form>
  )
}
