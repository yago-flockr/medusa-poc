import { forwardRef, useImperativeHandle, useMemo, useRef } from "react"

import NativeSelect, {
  NativeSelectProps,
} from "@/store/modules/common/components/native-select"
import { Field, FieldLabel } from "@/components/ui/field"
import { HttpTypes } from "@medusajs/types"

const CountrySelect = forwardRef<
  HTMLSelectElement,
  NativeSelectProps & {
    region?: HttpTypes.StoreRegion
  }
>(({ placeholder = "Country", region, defaultValue, ...props }, ref) => {
  const innerRef = useRef<HTMLSelectElement>(null)

  useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
    ref,
    () => innerRef.current,
  )

  const countryOptions = useMemo(() => {
    if (!region) {
      return []
    }

    return region.countries?.map((country) => ({
      value: country.iso_2,
      label: country.display_name,
    }))
  }, [region])

  return (
    <Field>
      <FieldLabel htmlFor={props.name}>
        Country
        {props.required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <NativeSelect
        ref={innerRef}
        id={props.name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        {...props}
      >
        {countryOptions?.map(({ value, label }, index) => (
          <option key={index} value={value}>
            {label}
          </option>
        ))}
      </NativeSelect>
    </Field>
  )
})

CountrySelect.displayName = "CountrySelect"

export default CountrySelect
