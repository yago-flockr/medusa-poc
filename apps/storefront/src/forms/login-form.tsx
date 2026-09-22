"use client"

import { Button } from "@/components/ui/button"
import { TextField } from "@/forms/fields/text-field"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ComponentProps } from "react"
import { useForm } from "react-hook-form"
import z from "zod"

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

type LoginSchema = z.infer<typeof loginSchema>

type LoginFormProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  isLoading?: boolean
  onSubmit: (values: LoginSchema) => void
}

export function LoginForm({
  isLoading,
  onSubmit,
  className,
  ...props
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values))}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <TextField
        id="login-email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <TextField
        id="login-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in…" : "Log in"}
      </Button>
    </form>
  )
}
