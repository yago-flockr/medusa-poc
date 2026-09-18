import type { ComponentProps } from "react"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"
import type { SelectFieldOption } from "./select-field"

type ComboboxChipsFieldProps = {
  id: string
  label: string
  options: SelectFieldOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
} & Omit<
  ComponentProps<typeof Combobox<SelectFieldOption, true>>,
  | "multiple"
  | "items"
  | "value"
  | "onValueChange"
  | "isItemEqualToValue"
  | "children"
>

export function ComboboxChipsField({
  id,
  label,
  options,
  value,
  onValueChange,
  placeholder,
  ...props
}: ComboboxChipsFieldProps) {
  const anchor = useComboboxAnchor()

  if (!options.length) return null

  const selected = options.filter((option) => value.includes(option.value))

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Combobox
        multiple
        items={options}
        value={selected}
        onValueChange={(next) =>
          onValueChange(next.map((option) => option.value))
        }
        isItemEqualToValue={(a, b) => a.value === b.value}
        {...props}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values: SelectFieldOption[]) => (
              <>
                {values.map((option) => (
                  <ComboboxChip key={option.value}>{option.label}</ComboboxChip>
                ))}
                <ComboboxChipsInput id={id} placeholder={placeholder} />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
          <ComboboxList>
            {(option: SelectFieldOption) => (
              <ComboboxItem key={option.value} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
