import { listRegions } from "@/store/lib/data/regions"
import { createResourceQueryHook } from "./create-resource-query"
import { queryKeys } from "./query-keys"

export const useListRegions = createResourceQueryHook<
  void,
  Awaited<ReturnType<typeof listRegions>>
>({
  queryKey: () => queryKeys.regions.listRegions,
  queryFn: () => listRegions(),
})
