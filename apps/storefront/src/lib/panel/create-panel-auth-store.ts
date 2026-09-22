"use client"

import type { QueryClient } from "@tanstack/react-query"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type PanelAuthState = {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
}

export function createPanelAuthStore({
  storageKey,
  queryClient,
}: {
  storageKey: string
  queryClient: QueryClient
}) {
  return create<PanelAuthState>()(
    persist(
      (set) => ({
        token: null,
        setToken: (token) => set({ token }),
        clearToken: () => {
          set({ token: null })
          queryClient.clear()
        },
      }),
      { name: storageKey },
    ),
  )
}
