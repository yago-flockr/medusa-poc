"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useUpdateVendorProfile } from "@/vendor/hooks/mutations/profile"
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
  const updateVendorProfile = useUpdateVendorProfile()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateVendorProfileInput>({
    resolver: zodResolver(updateVendorProfileSchema),
    defaultValues,
  })

  const submit = handleSubmit((values) => {
    updateVendorProfile.mutate(values, { onSuccess: onSaved })
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
      <Button type="submit" disabled={updateVendorProfile.isPending}>
        {updateVendorProfile.isPending ? "Saving…" : "Save"}
      </Button>
      {updateVendorProfile.isError && (
        <p className="text-sm text-destructive">
          {updateVendorProfile.error.message}
        </p>
      )}
    </form>
  )
}
