"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PatchVendorsMeInput } from "@dtc/api-contracts/vendor/profile"
import type { VendorUser } from "@dtc/api-contracts/vendor/vendor"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { TextField } from "./fields/text-field"
import type { CommonFormProps } from "./form-type"

export const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
})

export type ProfileSchema = z.infer<typeof profileSchema>

type ProfileFormProps = CommonFormProps<ProfileSchema>

export function profileFormToInput(values: ProfileSchema): PatchVendorsMeInput {
  return {
    first_name: values.first_name,
    last_name: values.last_name,
  }
}

export function profileInputToForm(
  vendorUser: Pick<VendorUser, "first_name" | "last_name">,
): ProfileSchema {
  return {
    first_name: vendorUser.first_name ?? "",
    last_name: vendorUser.last_name ?? "",
  }
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
    defaultValues: {
      first_name: "",
      last_name: "",
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
        id="vendor-first-name"
        label="First name"
        error={errors.first_name?.message}
        {...register("first_name")}
      />
      <TextField
        id="vendor-last-name"
        label="Last name"
        error={errors.last_name?.message}
        {...register("last_name")}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving…" : "Save"}
      </Button>
    </form>
  )
}
