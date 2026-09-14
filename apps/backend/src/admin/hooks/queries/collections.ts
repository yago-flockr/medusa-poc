import { useQuery } from "@tanstack/react-query"
import type {
  Collection,
  CollectionQuery,
} from "../../../api/admin/collections/types"
import { queryKeys } from "./query-keys"
import { sdk } from "../../lib/sdk"

export const useAdminCollectionRetrieve = (
  id: string,
  query?: CollectionQuery,
) =>
  useQuery({
    queryKey: [...queryKeys.collections.findOne, id, query],
    queryFn: async () => {
      const { collection } = await sdk.admin.productCollection.retrieve(
        id,
        query,
      )
      return collection as Collection
    },
  })
