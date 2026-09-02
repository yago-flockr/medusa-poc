"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PostAuthVendorEmailpassInput } from "@dtc/api-contracts/vendor/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { TextField } from "./fields/text-field"
import type { CommonFormProps } from "./form-type"

export const loginVendorSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export type LoginVendorSchema = z.infer<typeof loginVendorSchema>

type LoginFormProps = CommonFormProps<LoginVendorSchema>

export function loginVendorFormToInput(
  values: LoginVendorSchema,
): PostAuthVendorEmailpassInput {
  return {
    email: values.email,
    password: values.password,
  }
}

export function loginVendorInputToForm(
  values: PostAuthVendorEmailpassInput,
): LoginVendorSchema {
  return {
    email: values.email,
    password: values.password,
  }
}

export function LoginForm({ isLoading, onSubmit, className }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginVendorSchema>({
    resolver: zodResolver(loginVendorSchema),
    defaultValues: { email: "", password: "" },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit?.(values))}
      className={cn("flex flex-col gap-4", className)}
    >
      <TextField
        id="vendor-email"
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <TextField
        id="vendor-password"
        label="Password"
        type="password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in…" : "Log in"}
      </Button>
    </form>
  )
}
