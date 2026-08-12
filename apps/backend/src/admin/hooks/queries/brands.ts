import { useQuery } from "@tanstack/react-query"
import type { InferTypeOf } from "@medusajs/framework/types"
import { Brand } from "../../../modules/brand/models/brand"
import {
  expandField,
  expandFields,
  type ExpandSelection,
} from "../../lib/expand-fields"
import { sdk } from "../../lib/sdk"

type BrandListQuery = NonNullable<
  Parameters<typeof sdk.admin.product.retrieve>[1]
>

type ProductBase = Awaited<
  ReturnType<typeof sdk.admin.product.retrieve>
>["product"]

const productExpand = {
  brand: expandField<InferTypeOf<typeof Brand> | null>("+brand.*"),
}

export const useAdminProductRetrieve = <
  TKey extends keyof typeof productExpand,
>(
  id: string,
  expand: TKey[],
  query?: Omit<BrandListQuery, "fields">
) => {
  const fields = expandFields(productExpand, expand)

  return useQuery({
    queryKey: ["admin", "product", id, expand, query],
    queryFn: async () => {
      const { product } = await sdk.admin.product.retrieve(id, {
        ...query,
        ...(fields ? { fields } : {}),
      })

      return product as ProductBase &
        ExpandSelection<typeof productExpand, TKey>
    },
  })
}
