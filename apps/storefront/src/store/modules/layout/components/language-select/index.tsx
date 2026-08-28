"use client"

import { useRouter } from "next/navigation"
import { useMemo, useTransition } from "react"
import ReactCountryFlag from "react-country-flag"

import { updateLocale } from "@/store/lib/data/locale-actions"
import { Locale } from "@/store/lib/data/locales"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const getCountryCodeFromLocale = (localeCode: string): string => {
  try {
    const locale = new Intl.Locale(localeCode)
    if (locale.region) {
      return locale.region.toUpperCase()
    }
    const maximized = locale.maximize()
    return maximized.region?.toUpperCase() ?? localeCode.toUpperCase()
  } catch {
    const parts = localeCode.split(/[-_]/)
    return parts.length > 1 ? parts[1].toUpperCase() : parts[0].toUpperCase()
  }
}

/**
 * Gets the localized display name for a language code using Intl API.
 * Falls back to the provided name if Intl is unavailable.
 */
const getLocalizedLanguageName = (
  code: string,
  fallbackName: string,
  displayLocale: string = "en-US",
): string => {
  try {
    const displayNames = new Intl.DisplayNames([displayLocale], {
      type: "language",
    })
    return displayNames.of(code) ?? fallbackName
  } catch {
    return fallbackName
  }
}

type LanguageSelectProps = {
  locales: Locale[]
  currentLocale: string | null
}

const LanguageSelect = ({ locales, currentLocale }: LanguageSelectProps) => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const options = useMemo(() => {
    return locales.map((locale) => ({
      code: locale.code,
      countryCode: getCountryCodeFromLocale(locale.code),
      localizedName: getLocalizedLanguageName(
        locale.code,
        locale.name,
        currentLocale ?? "en-US",
      ),
    }))
  }, [locales, currentLocale])

  const handleChange = (code: string) => {
    startTransition(async () => {
      await updateLocale(code)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-x-2 text-sm">
      <span className="text-muted-foreground">Language:</span>
      <Select
        value={currentLocale ?? ""}
        onValueChange={(value) => handleChange(value as string)}
        disabled={isPending}
      >
        <SelectTrigger className="w-full min-w-[180px]">
          <SelectValue placeholder="Default" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Default</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.code} value={o.code}>
              <span className="flex items-center gap-x-2">
                <ReactCountryFlag
                  svg
                  style={{ width: "16px", height: "16px" }}
                  countryCode={o.countryCode}
                />
                {o.localizedName}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default LanguageSelect
