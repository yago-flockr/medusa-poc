"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { loginVendorAdmin, setVendorToken } from "./api"

type State = { error: string } | null

export function LoginForm() {
  const router = useRouter()
  const [message, formAction] = useActionState<State, FormData>(
    async (_prevState, formData) => {
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      try {
        const { token } = await loginVendorAdmin(email, password)
        setVendorToken(token)
      } catch (error) {
        return { error: (error as Error).message }
      }

      router.push("/vendor/dashboard")
      return null
    },
    null,
  )

  return (
    <form action={formAction} className="border rounded-md p-4">
      <h2 className="font-medium mb-4">Vendor log in</h2>
      <div className="flex flex-col gap-2">
        <label className="text-sm">
          Email
          <input
            type="email"
            name="email"
            required
            className="w-full border rounded px-2 py-1"
          />
        </label>
        <label className="text-sm">
          Password
          <input
            type="password"
            name="password"
            required
            className="w-full border rounded px-2 py-1"
          />
        </label>
      </div>
      <button
        type="submit"
        className="mt-4 w-full bg-black text-white rounded px-3 py-2 text-sm"
      >
        Log in
      </button>
      {message?.error && (
        <p className="text-sm text-red-600 mt-2">{message.error}</p>
      )}
    </form>
  )
}
