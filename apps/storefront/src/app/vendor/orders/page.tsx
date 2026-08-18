"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getVendorToken, listVendorOrders } from "../api"
import type { VendorOrder } from "../types"
import { useVendorErrorHandler } from "../use-vendor-error"

export default function VendorOrdersPage() {
  const router = useRouter()
  const handleError = useVendorErrorHandler()
  const [orders, setOrders] = useState<VendorOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!getVendorToken()) {
      router.replace("/vendor")
      return
    }
    listVendorOrders()
      .then(({ orders }) => setOrders(orders))
      .catch((err) => setError(handleError(err)))
      .finally(() => setLoading(false))
  }, [router, handleError])

  if (loading) {
    return null
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">My orders</h2>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">No orders yet.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id} className="py-2 border-b">
              <strong>{order.id}</strong> — {order.status}
              {order.total !== undefined && (
                <span>
                  {" "}
                  — {order.total} {order.currency_code}
                </span>
              )}
              {order.items && order.items.length > 0 && (
                <div className="text-sm text-gray-500">
                  {order.items.map((item) => item.title).join(", ")}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
