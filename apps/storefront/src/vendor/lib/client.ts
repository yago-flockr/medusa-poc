import type { PostVendorsUploadsResponse } from "@dtc/api-contracts/vendor/uploads"
import { createPanelApiClient } from "@/lib/panel/create-panel-api-client"
import { useVendorAuthStore } from "../stores/auth-store"

const client = createPanelApiClient({
  getToken: () => useVendorAuthStore.getState().token,
  onUnauthorized: () => useVendorAuthStore.getState().clearToken(),
})

export const { assertOkResponse, request } = client

export async function uploadVendorImages(
  files: File[],
): Promise<PostVendorsUploadsResponse> {
  const body = new FormData()
  for (const file of files) {
    body.append("files", file)
  }

  return client.requestFormData<PostVendorsUploadsResponse>(
    "/vendors/uploads",
    body,
  )
}
