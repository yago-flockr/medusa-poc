import { useQuery } from "@tanstack/react-query"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

const PAGE_SIZE = 20

export type StoreProductOption = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
}

type StoreProductsResponse = {
  products: StoreProductOption[]
  count: number
}

export const useGetStoreProducts = (search: string) =>
  useQuery({
    queryKey: ["getStoreProducts", search],
    queryFn: async (): Promise<StoreProductsResponse> => {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        fields: "id,title,handle,thumbnail",
      })

      if (search.trim()) {
        params.set("q", search.trim())
      }

      const res = await fetch(`${BACKEND_URL}/store/products?${params}`, {
        headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
      })

      if (!res.ok) {
        throw new Error("Could not load the product catalogue.")
      }

      return res.json()
    },
    placeholderData: (previous) => previous,
  })
