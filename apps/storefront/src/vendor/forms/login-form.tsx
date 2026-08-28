"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import z from "zod"
import { Button } from "@/components/ui/button"
import { TextField } from "./fields/text-field"
import type { CommonFormProps } from "./form-type"

export const loginVendorSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export type LoginVendorInput = z.infer<typeof loginVendorSchema>

type LoginFormProps = CommonFormProps<LoginVendorInput> & {
  error?: string
  className?: string
}

export function LoginForm({
  isLoading,
  onSubmit,
  error,
  className,
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginVendorInput>({
    resolver: zodResolver(loginVendorSchema),
    defaultValues: { email: "", password: "" },
  })

  const submit = handleSubmit((values) => onSubmit(values))

  return (
    <form onSubmit={submit} className={cn("flex flex-col gap-4", className)}>
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
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
