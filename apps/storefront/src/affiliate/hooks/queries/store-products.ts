import { useQuery } from "@tanstack/react-query"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

export type StoreProductOption = {
  id: string
  title: string
  handle: string
}

type StoreProductsResponse = {
  products: StoreProductOption[]
}

export const useGetStoreProducts = () =>
  useQuery({
    queryKey: ["getStoreProducts"],
    queryFn: async (): Promise<StoreProductsResponse> => {
      const res = await fetch(
        `${BACKEND_URL}/store/products?limit=100&fields=id,title,handle`,
        { headers: { "x-publishable-api-key": PUBLISHABLE_KEY } },
      )

      if (!res.ok) {
        throw new Error("Could not load the product catalogue.")
      }

      return res.json()
    },
  })
