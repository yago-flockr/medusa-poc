"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  deleteVendorProduct,
  getVendorToken,
  listVendorProducts,
  updateVendorProduct,
} from "../api"
import type { VendorProduct } from "../types"
import { useVendorErrorHandler } from "../use-vendor-error"
import { CreateProductForm } from "./create-form"
import { ProductRow } from "./product-row"

export default function VendorProductsPage() {
  const router = useRouter()
  const handleError = useVendorErrorHandler()
  const [products, setProducts] = useState<VendorProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const { products } = await listVendorProducts()
      setProducts(products)
      setError(null)
    } catch (err) {
      setError(handleError(err))
    }
  }, [handleError])

  useEffect(() => {
    if (!getVendorToken()) {
      router.replace("/vendor")
      return
    }
    refresh().finally(() => setLoading(false))
  }, [router, refresh])

  const handleSave = async (id: string, title: string) => {
    try {
      await updateVendorProduct(id, { title })
      await refresh()
    } catch (err) {
      setError(handleError(err))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteVendorProduct(id)
      await refresh()
    } catch (err) {
      setError(handleError(err))
    }
  }

  if (loading) {
    return null
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">My products</h2>
      <CreateProductForm onCreated={refresh} />
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {products.length === 0 ? (
        <p className="text-sm text-gray-500">No products yet.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
