"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { vendorQueryClient } from "../lib/query-client"

export type VendorAuthState = {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
}

export const useVendorAuthStore = create<VendorAuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => {
        set({ token: null })
        vendorQueryClient.clear()
      },
    }),
    { name: "vendor_token" },
  ),
)
