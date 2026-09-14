import { useQuery } from "@tanstack/react-query"
import type {
  ProductCategory,
  ProductCategoryQuery,
} from "../../../api/admin/product-categories/types"
import { queryKeys } from "./query-keys"
import { sdk } from "../../lib/sdk"

export const useAdminProductCategoryRetrieve = (
  id: string,
  query?: ProductCategoryQuery,
) =>
  useQuery({
    queryKey: [...queryKeys.productCategories.findOne, id, query],
    queryFn: async () => {
      const { product_category } = await sdk.admin.productCategory.retrieve(
        id,
        query,
      )
      return product_category as ProductCategory
    },
  })
