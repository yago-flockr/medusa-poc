"use client"

import { createPanelAuthStore } from "@/lib/panel/create-panel-auth-store"
import { affiliateQueryClient } from "../lib/query-client"

export const useAffiliateAuthStore = createPanelAuthStore({
  storageKey: "affiliate_token",
  queryClient: affiliateQueryClient,
})
