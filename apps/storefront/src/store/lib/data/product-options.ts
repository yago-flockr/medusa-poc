import { sdk } from "@/store/lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listProductOptions = async () => {
  const next = {
    ...(await getCacheOptions("product-options")),
  }

  return sdk.client
    .fetch<{ product_options: HttpTypes.StoreProductOption[] }>(
      "/store/product-options",
      {
        query: {
          is_exclusive: false,
          fields: "*values",
        },
        next,
        cache: "force-cache",
      },
    )
    .then(({ product_options }) => product_options)
}
