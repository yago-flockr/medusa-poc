import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { PostAdminProductCategoriesByIdStorefrontContentInput } from "@dtc/api-contracts/admin/product-category-storefront-content"
import { queryKeys } from "../queries/query-keys"
import { sdk } from "../../lib/sdk"

export const useAdminProductCategoryStorefrontContentUpdate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: PostAdminProductCategoriesByIdStorefrontContentInput
    }) =>
      sdk.client.fetch(`/admin/product-categories/${id}/storefront-content`, {
        method: "POST",
        body,
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.productCategories.findOne, id],
      })
    },
  })
}
