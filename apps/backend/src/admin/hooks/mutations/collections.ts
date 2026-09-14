import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { PostAdminCollectionsByIdStorefrontContentInput } from "@dtc/api-contracts/admin/collection-storefront-content"
import { queryKeys } from "../queries/query-keys"
import { sdk } from "../../lib/sdk"

export const useAdminCollectionStorefrontContentUpdate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: PostAdminCollectionsByIdStorefrontContentInput
    }) =>
      sdk.client.fetch(`/admin/collections/${id}/storefront-content`, {
        method: "POST",
        body,
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.collections.findOne, id],
      })
    },
  })
}
