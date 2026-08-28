"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  updateVendorProfileSchema,
  type UpdateVendorProfileInput,
} from "@dtc/api-contracts/vendor/profile"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TextField } from "./fields/text-field"
import type { CommonFormProps } from "./form-type"

type ProfileFormProps = CommonFormProps<UpdateVendorProfileInput> & {
  defaultValues: UpdateVendorProfileInput
  error?: string
  className?: string
}

export function ProfileForm({
  defaultValues,
  isLoading,
  onSubmit,
  error,
  className,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateVendorProfileInput>({
    resolver: zodResolver(updateVendorProfileSchema),
    defaultValues,
  })

  const submit = handleSubmit((values) => onSubmit(values))

  return (
    <form onSubmit={submit} className={cn("flex flex-col gap-4", className)}>
      <TextField
        id="profile-first-name"
        label="Your first name"
        error={errors.first_name?.message}
        {...register("first_name")}
      />
      <TextField
        id="profile-last-name"
        label="Your last name"
        error={errors.last_name?.message}
        {...register("last_name")}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving…" : "Save"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
