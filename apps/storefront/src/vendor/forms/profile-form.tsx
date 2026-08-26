"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useUpdateProfile } from "@/vendor/hooks/mutations/profile"
import {
  updateVendorProfileSchema,
  type UpdateVendorProfileInput,
} from "@dtc/api-contracts/vendor/profile"
import { useForm } from "react-hook-form"
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TextField } from "./fields/text-field"

type ProfileFormProps = Omit<
  ComponentProps<"form">,
  "onSubmit" | "children"
> & {
  defaultValues: UpdateVendorProfileInput
  onSaved?: () => void
}

export function ProfileForm({
  defaultValues,
  onSaved,
  className,
  ...props
}: ProfileFormProps) {
  const updateProfile = useUpdateProfile()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateVendorProfileInput>({
    resolver: zodResolver(updateVendorProfileSchema),
    defaultValues,
  })

  const submit = handleSubmit((values) => {
    updateProfile.mutate(values, { onSuccess: onSaved })
  })

  return (
    <form
      onSubmit={submit}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
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
      <Button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? "Saving…" : "Save"}
      </Button>
      {updateProfile.isError && (
        <p className="text-sm text-destructive">
          {updateProfile.error.message}
        </p>
      )}
    </form>
  )
}
