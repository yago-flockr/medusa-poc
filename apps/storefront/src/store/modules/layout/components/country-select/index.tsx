"use client"

import { useMemo } from "react"
import ReactCountryFlag from "react-country-flag"

import { updateRegion } from "@/store/lib/data/cart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HttpTypes } from "@medusajs/types"
import { useParams, usePathname } from "next/navigation"

type CountryOption = {
  country: string
  region: string
  label: string
}

type CountrySelectProps = {
  regions: HttpTypes.StoreRegion[]
}

const CountrySelect = ({ regions }: CountrySelectProps) => {
  const { country } = useParams()
  const currentPath = usePathname().split(`/${country}`)[1]

  const options = useMemo(() => {
    return regions
      ?.map((r) => {
        return r.countries?.map((c) => ({
          country: c.iso_2 ?? "",
          region: r.id,
          label: c.display_name ?? "",
        }))
      })
      .flat()
      .filter((o): o is CountryOption => !!o)
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [regions])

  return (
    <div className="flex items-center gap-x-2 text-sm">
      <span className="text-muted-foreground">Shipping to:</span>
      <Select
        value={typeof country === "string" ? country : undefined}
        onValueChange={(value) => updateRegion(value as string, currentPath)}
      >
        <SelectTrigger className="w-full min-w-[180px]">
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent>
          {options?.map((o) => (
            <SelectItem key={o.country} value={o.country}>
              <span className="flex items-center gap-x-2">
                <ReactCountryFlag
                  svg
                  style={{ width: "16px", height: "16px" }}
                  countryCode={o.country}
                />
                {o.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default CountrySelect
