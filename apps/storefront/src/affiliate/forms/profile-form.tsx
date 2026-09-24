"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PatchAffiliatesMeInput } from "@dtc/api-contracts/affiliate/profile"
import type { AffiliateMe } from "@dtc/api-contracts/affiliate/me"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { TextField } from "@/forms/fields/text-field"
import type { CommonFormProps } from "@/forms/form-type"

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

export type ProfileSchema = z.infer<typeof profileSchema>

type ProfileFormProps = CommonFormProps<ProfileSchema>

export function profileFormToInput(
  values: ProfileSchema,
): PatchAffiliatesMeInput {
  return { name: values.name }
}

export function profileInputToForm(
  affiliate: Pick<AffiliateMe, "name">,
): ProfileSchema {
  return { name: affiliate.name }
}

export function ProfileForm({
  defaultValues,
  isLoading,
  onSubmit,
  className,
  ...props
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", ...defaultValues },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit?.(values))}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <TextField
        id="affiliate-name"
        label="Name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving…" : "Save"}
      </Button>
    </form>
  )
}
