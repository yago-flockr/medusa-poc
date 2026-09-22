"use client"

import { createPanelAuthStore } from "@/lib/panel/create-panel-auth-store"
import { vendorQueryClient } from "../lib/query-client"

export const useVendorAuthStore = createPanelAuthStore({
  storageKey: "vendor_token",
  queryClient: vendorQueryClient,
})
