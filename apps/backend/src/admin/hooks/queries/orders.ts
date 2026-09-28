import { useQuery } from "@tanstack/react-query"
import type { Order, OrderQuery } from "../../../api/admin/orders/types"
import { queryKeys } from "./query-keys"
import { sdk } from "../../lib/sdk"

export const useAdminOrderRetrieve = (id: string, query?: OrderQuery) =>
  useQuery({
    queryKey: [...queryKeys.orders.findOne, id, query],
    queryFn: async () => {
      const { order } = await sdk.admin.order.retrieve(id, query)
      return order as Order
    },
  })
