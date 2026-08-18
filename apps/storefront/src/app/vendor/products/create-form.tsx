"use client"

import { useActionState, useMemo, useRef, useState } from "react"
import {
  createVendorProduct,
  uploadVendorImages,
  type VendorProductOption,
  type VendorProductVariantInput,
} from "../api"
import { useVendorErrorHandler } from "../use-vendor-error"

type State = { error: string } | null

type Props = {
  onCreated: () => void
}

type OptionRow = {
  title: string
  values: string
}

type VariantRowState = {
  price: string
  sku: string
  weight: string
  imageIndexes: number[]
  thumbnailIndex: number | null
}

const emptyVariantRow: VariantRowState = {
  price: "",
  sku: "",
  weight: "",
  imageIndexes: [],
  thumbnailIndex: null,
}

function comboKey(combo: Record<string, string>) {
  return Object.keys(combo)
    .sort()
    .map((key) => `${key}=${combo[key]}`)
    .join("|")
}

function cartesianProduct(options: VendorProductOption[]) {
  return options.reduce<Record<string, string>[]>(
    (combinations, option) =>
      combinations.flatMap((combination) =>
        option.values.map((value) => ({
          ...combination,
          [option.title]: value,
        })),
      ),
    [{}],
  )
}

export function CreateProductForm({ onCreated }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const handleError = useVendorErrorHandler()
  const [optionRows, setOptionRows] = useState<OptionRow[]>([])
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
  const [variantRows, setVariantRows] = useState<Record<string, VariantRowState>>({})

  const parsedOptions: VendorProductOption[] = optionRows
    .filter((row) => row.title.trim() && row.values.trim())
    .map((row) => ({
      title: row.title.trim(),
      values: row.values
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    }))

  const combinations = useMemo(
    () => (parsedOptions.length ? cartesianProduct(parsedOptions) : [{}]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(parsedOptions)],
  )

  const getVariantRow = (key: string) => variantRows[key] ?? emptyVariantRow

  const updateVariantRow = (
    key: string,
    patch: Partial<VariantRowState>,
  ) =>
    setVariantRows((rows) => ({
      ...rows,
      [key]: { ...getVariantRow(key), ...patch },
    }))

  const toggleVariantImage = (key: string, fileIndex: number) => {
    const row = getVariantRow(key)
    const isSelected = row.imageIndexes.includes(fileIndex)
    const imageIndexes = isSelected
      ? row.imageIndexes.filter((index) => index !== fileIndex)
      : [...row.imageIndexes, fileIndex]
    const thumbnailIndex = isSelected && row.thumbnailIndex === fileIndex
      ? null
      : row.thumbnailIndex
    updateVariantRow(key, { imageIndexes, thumbnailIndex })
  }

  const [message, formAction] = useActionState<State, FormData>(
    async (_prevState, formData) => {
      const title = formData.get("title") as string
      const description = formData.get("description") as string

      for (const combo of combinations) {
        const row = getVariantRow(comboKey(combo))
        const price = Number(row.price)
        if (!Number.isFinite(price) || price <= 0) {
          const label = Object.values(combo).join(" / ") || "the product"
          return { error: `Enter a price greater than 0 for ${label}.` }
        }
      }

      try {
        const uploaded = stagedFiles.length
          ? (await uploadVendorImages(stagedFiles)).files
          : []

        const variants: VendorProductVariantInput[] = combinations.map(
          (combo) => {
            const row = getVariantRow(comboKey(combo))
            const price = Number(row.price)
            const images = row.imageIndexes
              .map((index) => uploaded[index])
              .filter(Boolean)
              .map((file) => ({ url: file.url }))
            const thumbnail =
              row.thumbnailIndex !== null
                ? uploaded[row.thumbnailIndex]?.url
                : undefined

            return {
              optionValues: combo,
              price,
              sku: row.sku.trim() || undefined,
              weight: row.weight ? Number(row.weight) : undefined,
              images: images.length ? images : undefined,
              thumbnail,
            }
          },
        )

        await createVendorProduct({
          title,
          description: description || undefined,
          images: uploaded.length
            ? uploaded.map((file) => ({ url: file.url }))
            : undefined,
          options: parsedOptions.length ? parsedOptions : undefined,
          variants,
        })
      } catch (error) {
        return { error: handleError(error) }
      }

      formRef.current?.reset()
      setOptionRows([])
      setStagedFiles([])
      setVariantRows({})
      onCreated()
      return null
    },
    null,
  )

  const addOptionRow = () =>
    setOptionRows((rows) => [...rows, { title: "", values: "" }])

  const removeOptionRow = (index: number) =>
    setOptionRows((rows) => rows.filter((_, i) => i !== index))

  const updateOptionRow = (
    index: number,
    field: keyof OptionRow,
    value: string,
  ) =>
    setOptionRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    )

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border rounded-md p-4 mb-6"
    >
      <h3 className="font-medium mb-2">Create a product</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        <input
          name="title"
          placeholder="Title"
          required
          className="border rounded px-2 py-1 flex-1"
        />
        <input
          name="description"
          placeholder="Description (optional)"
          className="border rounded px-2 py-1 flex-1"
        />
      </div>

      <div className="mb-2">
        <label className="text-sm block mb-1">
          Images (PNG/JPEG/WEBP/GIF, up to 5, 5MB each)
        </label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="text-sm"
          onChange={(e) =>
            setStagedFiles(e.target.files ? Array.from(e.target.files) : [])
          }
        />
      </div>

      <div className="mb-2">
        <p className="text-sm font-medium">Options (variants)</p>
        {optionRows.map((row, index) => (
          <div key={index} className="flex gap-2 mt-1">
            <input
              placeholder="Option name (e.g. Size)"
              value={row.title}
              onChange={(e) => updateOptionRow(index, "title", e.target.value)}
              className="border rounded px-2 py-1 flex-1"
            />
            <input
              placeholder="Comma-separated values (e.g. S, M, L)"
              value={row.values}
              onChange={(e) => updateOptionRow(index, "values", e.target.value)}
              className="border rounded px-2 py-1 flex-1"
            />
            <button
              type="button"
              onClick={() => removeOptionRow(index)}
              className="text-sm underline"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addOptionRow}
          className="text-sm underline mt-1"
        >
          + Add option
        </button>
      </div>

      <div className="mb-2">
        <p className="text-sm font-medium mb-1">
          Variants (one row per combination — each has its own price, SKU and
          images)
        </p>
        <div className="flex flex-col gap-3">
          {combinations.map((combo) => {
            const key = comboKey(combo)
            const row = getVariantRow(key)
            const label = Object.values(combo).join(" / ") || "Default"

            return (
              <div key={key} className="border rounded p-2">
                <p className="text-sm font-medium mb-1">{label}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Price (GBP)"
                    value={row.price}
                    onChange={(e) =>
                      updateVariantRow(key, { price: e.target.value })
                    }
                    className="border rounded px-2 py-1 w-32"
                  />
                  <input
                    placeholder="SKU (optional)"
                    value={row.sku}
                    onChange={(e) =>
                      updateVariantRow(key, { sku: e.target.value })
                    }
                    className="border rounded px-2 py-1 w-40"
                  />
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Weight g (optional)"
                    value={row.weight}
                    onChange={(e) =>
                      updateVariantRow(key, { weight: e.target.value })
                    }
                    className="border rounded px-2 py-1 w-36"
                  />
                </div>
                {stagedFiles.length > 0 && (
                  <div className="text-xs">
                    <p className="text-gray-500 mb-1">
                      Images for this variant (pick one as thumbnail):
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {stagedFiles.map((file, fileIndex) => (
                        <label
                          key={fileIndex}
                          className="flex items-center gap-1"
                        >
                          <input
                            type="checkbox"
                            checked={row.imageIndexes.includes(fileIndex)}
                            onChange={() => toggleVariantImage(key, fileIndex)}
                          />
                          {file.name}
                          {row.imageIndexes.includes(fileIndex) && (
                            <input
                              type="radio"
                              name={`thumbnail-${key}`}
                              checked={row.thumbnailIndex === fileIndex}
                              onChange={() =>
                                updateVariantRow(key, {
                                  thumbnailIndex: fileIndex,
                                })
                              }
                              title="Use as thumbnail"
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <button
        type="submit"
        className="bg-black text-white rounded px-3 py-1 text-sm mt-2"
      >
        Create product
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Each variant&apos;s price applies across every currency the store
        supports — no conversion, this is test data.
      </p>
      {message?.error && (
        <p className="text-sm text-red-600 mt-2">{message.error}</p>
      )}
    </form>
  )
}
