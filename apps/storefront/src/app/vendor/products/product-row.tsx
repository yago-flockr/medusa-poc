"use client"

import { useState, useTransition } from "react"
import type { VendorProduct } from "../types"

type Props = {
  product: VendorProduct
  onSave: (id: string, title: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function describeVariants(product: VendorProduct): string | null {
  const variants = product.variants
  if (!variants?.length) {
    return null
  }

  const gbpPrices = variants
    .map((variant) =>
      variant.prices.find((price) => price.currency_code === "gbp")?.amount,
    )
    .filter((amount): amount is number => amount !== undefined)

  if (!gbpPrices.length) {
    return `${variants.length} variant${variants.length > 1 ? "s" : ""}`
  }

  const min = Math.min(...gbpPrices)
  const max = Math.max(...gbpPrices)
  const priceLabel = min === max ? `£${min}` : `£${min}–£${max}`

  return `${variants.length} variant${variants.length > 1 ? "s" : ""} · ${priceLabel}`
}

export function ProductRow({ product, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(product.title)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => startTransition(() => onDelete(product.id))
  const variantSummary = describeVariants(product)

  if (!editing) {
    return (
      <li className="flex items-center gap-2 py-2 border-b">
        <span className="flex-1">
          {product.title} — <em className="text-gray-500">{product.status}</em>
          {variantSummary && (
            <span className="text-gray-500"> — {variantSummary}</span>
          )}
        </span>
        <button onClick={() => setEditing(true)} className="text-sm underline">
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-sm underline text-red-600"
        >
          Delete
        </button>
      </li>
    )
  }

  const handleSave = () => {
    startTransition(async () => {
      await onSave(product.id, title)
      setEditing(false)
    })
  }

  return (
    <li className="flex items-center gap-2 py-2 border-b">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border rounded px-2 py-1 flex-1"
      />
      <button
        onClick={handleSave}
        disabled={isPending}
        className="text-sm underline"
      >
        Save
      </button>
      <button
        onClick={() => setEditing(false)}
        disabled={isPending}
        className="text-sm underline"
      >
        Cancel
      </button>
    </li>
  )
}
