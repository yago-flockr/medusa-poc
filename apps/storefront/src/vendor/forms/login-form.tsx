"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useLoginVendor } from "@/vendor/hooks/mutations/auth"
import { useVendorAuthStore } from "@/vendor/stores/auth-store"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import type { ComponentProps } from "react"
import z from "zod"
import { Button } from "@/components/ui/button"
import { TextField } from "./fields/text-field"

export const loginVendorSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export type LoginVendorInput = z.infer<typeof loginVendorSchema>

type LoginFormProps = Omit<ComponentProps<"form">, "onSubmit" | "children">

export function LoginForm({ className, ...props }: LoginFormProps) {
  const loginVendor = useLoginVendor()
  const setToken = useVendorAuthStore((state) => state.setToken)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginVendorInput>({
    resolver: zodResolver(loginVendorSchema),
    defaultValues: { email: "", password: "" },
  })

  const submit = handleSubmit((values) => {
    loginVendor.mutate(values, {
      onSuccess: ({ token }: { token: string }) => {
        setToken(token)
      },
    })
  })

  return (
    <form onSubmit={submit} className={cn("flex flex-col gap-4", className)} {...props}>
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
      <Button type="submit" disabled={loginVendor.isPending}>
        {loginVendor.isPending ? "Logging in…" : "Log in"}
      </Button>
      {loginVendor.isError && (
        <p className="text-sm text-destructive">
          {loginVendor.error.message}
        </p>
      )}
    </form>
  )
}
