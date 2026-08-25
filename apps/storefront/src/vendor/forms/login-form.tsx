"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { setVendorToken } from "@vendor/lib/client"
import { useLoginVendor } from "@vendor/hooks/mutations/auth"
import z from "zod"

export const loginVendorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type LoginVendorInput = z.infer<typeof loginVendorSchema>

export function LoginForm() {
  const router = useRouter()
  const loginMutation = useLoginVendor()
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
      onSuccess: ({ token }) => {
        setVendorToken(token)
        router.push("/vendor/dashboard")
      },
    })
  })

  return (
    <form onSubmit={submit} className="border rounded-md p-4">
      <h2 className="font-medium mb-4">Vendor log in</h2>
      <div className="flex flex-col gap-2">
        <label className="text-sm">
          Email
          <input
            type="email"
            className="w-full border rounded px-2 py-1"
            {...register("email")}
          />
          {errors.email && (
            <span className="block text-sm text-red-600">
              {errors.email.message}
            </span>
          )}
        </label>
        <label className="text-sm">
          Password
          <input
            type="password"
            className="w-full border rounded px-2 py-1"
            {...register("password")}
          />
          {errors.password && (
            <span className="block text-sm text-red-600">
              {errors.password.message}
            </span>
          )}
        </label>
      </div>
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="mt-4 w-full bg-black text-white rounded px-3 py-2 text-sm disabled:opacity-50"
      >
        {loginMutation.isPending ? "Logging in…" : "Log in"}
      </button>
      {loginMutation.isError && (
        <p className="text-sm text-red-600 mt-2">
          {loginMutation.error.message}
        </p>
      )}
    </form>
  )
}
