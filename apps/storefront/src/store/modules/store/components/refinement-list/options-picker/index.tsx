"use client"

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useEffect, useState } from "react"

import { sdk } from "@/store/lib/config"
import { cn } from "@/lib/utils"
import { HttpTypes } from "@medusajs/types"

type OptionsPickerProps = {
  selectedValueIds: string[]
  setOptionValueIds: (valueIds: string[]) => void
}

const OptionsPicker = ({
  selectedValueIds,
  setOptionValueIds,
}: OptionsPickerProps) => {
  const [options, setOptions] = useState<HttpTypes.StoreProductOption[]>([])
  const [openItems, setOpenItems] = useState<string[]>([])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await sdk.client.fetch<{
          product_options?: HttpTypes.StoreProductOption[]
        }>("/store/product-options", {
          method: "GET",
          query: {
            is_exclusive: false,
            fields: "*values",
          },
        })

        if (response?.product_options) {
          setOptions(response.product_options)
        }
      } catch (error) {
        console.error("Failed to fetch product options", error)
      }
    }

    fetchOptions()
  }, [])

  useEffect(() => {
    if (options.length) {
      setOpenItems(options.map((option) => option.id))
    }
  }, [options])

  if (!options.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-medium text-muted-foreground">
          Options
        </span>
      </div>
      <Accordion
        value={openItems}
        onValueChange={(values) => setOpenItems(values as string[])}
        className="flex flex-col gap-y-3 pr-6"
      >
        {options.map((option) => {
          const values =
            option.values
              ?.map((value) => ({
                id: value.id,
                label: value.value,
              }))
              .filter(
                (value): value is { id: string; label: string } =>
                  !!value.id && !!value.label,
              ) || []

          if (!values.length) {
            return null
          }

          const toggleValue = (valueId: string) => {
            const isSelected = selectedValueIds.includes(valueId)
            const nextSelections = isSelected
              ? selectedValueIds.filter((id) => id !== valueId)
              : [...selectedValueIds, valueId]

            setOptionValueIds(Array.from(new Set(nextSelections)))
          }

          const selectedCount = values.filter((value) =>
            selectedValueIds.includes(value.id),
          ).length

          return (
            <AccordionItem key={option.id} value={option.id}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {option.title || "Option"}
                  </span>
                  <span className="text-muted-foreground">
                    ({selectedCount})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionPanel>
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => {
                    const isSelected = selectedValueIds.includes(value.id)

                    return (
                      <button
                        key={value.id}
                        onClick={() => toggleValue(value.id)}
                        className={cn(
                          "flex h-10 items-center rounded-md border border-input px-3 text-sm transition-colors duration-150",
                          {
                            "border-primary text-foreground": isSelected,
                            "text-muted-foreground hover:text-foreground":
                              !isSelected,
                          },
                        )}
                        aria-pressed={isSelected}
                      >
                        {value.label}
                      </button>
                    )
                  })}
                </div>
              </AccordionPanel>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

export default OptionsPicker
