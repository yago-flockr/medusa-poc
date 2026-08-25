import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { HttpTypes } from "@medusajs/framework/types"
import type { BrandAdditionalData } from "../../../api/admin/brands/additional-data"
import { queryKeys } from "../queries/query-keys"
import { sdk } from "../../lib/sdk"

type AdminProductUpdateBody = HttpTypes.AdminUpdateProduct & {
  additional_data?: BrandAdditionalData
}

export const useAdminProductUpdate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AdminProductUpdateBody }) =>
      sdk.admin.product.update(id, body),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.products.findOne, id],
      })
    },
  })
}
