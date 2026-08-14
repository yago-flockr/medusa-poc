import { useQuery } from "@tanstack/react-query"
import type {
  Product,
  ProductQuery,
} from "../../../api/admin/products/contract"
import { queryKeys } from "../../lib/query-keys"
import { sdk } from "../../lib/sdk"

export const useAdminProductRetrieve = (id: string, query?: ProductQuery) =>
  useQuery({
    queryKey: [...queryKeys.products.findOne, id, query],
    queryFn: async () => {
      const { product } = await sdk.admin.product.retrieve(id, query)
      return product as Product
    },
  })
