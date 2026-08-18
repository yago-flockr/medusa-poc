"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import {
  createVendor,
  loginVendorAdmin,
  registerVendorAdmin,
  setVendorToken,
} from "./api"

type State = { error: string } | null

export function RegisterForm() {
  const router = useRouter()
  const [message, formAction] = useActionState<State, FormData>(
    async (_prevState, formData) => {
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      const name = formData.get("name") as string
      const firstName = formData.get("first_name") as string

      try {
        const { token: registrationToken } = await registerVendorAdmin(
          email,
          password,
        )
        await createVendor(registrationToken, {
          name,
          admin: { email, first_name: firstName || undefined },
        })
        const { token } = await loginVendorAdmin(email, password)
        setVendorToken(token)
      } catch (error) {
        return { error: (error as Error).message }
      }

      router.push("/vendor/products")
      return null
    },
    null,
  )

  return (
    <form action={formAction} className="border rounded-md p-4">
      <h2 className="font-medium mb-1">Register a new vendor</h2>
      <p className="text-sm text-gray-500 mb-4">
        No invite flow yet — this is open self-registration until that&apos;s
        built.
      </p>
      <div className="flex flex-col gap-2">
        <label className="text-sm">
          Vendor name
          <input
            name="name"
            required
            className="w-full border rounded px-2 py-1"
          />
        </label>
        <label className="text-sm">
          Your first name
          <input
            name="first_name"
            className="w-full border rounded px-2 py-1"
          />
        </label>
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
        Create vendor
      </button>
      {message?.error && (
        <p className="text-sm text-red-600 mt-2">{message.error}</p>
      )}
    </form>
  )
}
