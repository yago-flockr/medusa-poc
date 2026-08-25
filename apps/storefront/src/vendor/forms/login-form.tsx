"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useLoginVendor } from "@/vendor/hooks/mutations/auth"
import {
  useVendorAuthStore,
  type VendorAuthState,
} from "@/vendor/stores/auth-store"
import { useForm } from "react-hook-form"
import z from "zod"
import { Button } from "@/components/ui/button"
import { TextField } from "./fields/text-field"

export const loginVendorSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export type LoginVendorInput = z.infer<typeof loginVendorSchema>

export function LoginForm() {
  const loginMutation = useLoginVendor()
  const setToken = useVendorAuthStore((s: VendorAuthState) => s.setToken)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginVendorInput>({
    resolver: zodResolver(loginVendorSchema),
    defaultValues: { email: "", password: "" },
  })

  const submit = handleSubmit((values) => {
    loginMutation.mutate(values, {
      onSuccess: ({ token }: { token: string }) => {
        setToken(token)
      },
    })
  })

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
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
      <Button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Logging in…" : "Log in"}
      </Button>
      {loginMutation.isError && (
        <p className="text-sm text-destructive">
          {loginMutation.error.message}
        </p>
      )}
    </form>
  )
}
