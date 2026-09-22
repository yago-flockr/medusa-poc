import { createPanelApiClient } from "@/lib/panel/create-panel-api-client"
import { useAffiliateAuthStore } from "../stores/auth-store"

const client = createPanelApiClient({
  getToken: () => useAffiliateAuthStore.getState().token,
  onUnauthorized: () => useAffiliateAuthStore.getState().clearToken(),
})

export const { assertOkResponse, request } = client
