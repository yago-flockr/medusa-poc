import { Hint, Label, Select, Text } from "@medusajs/ui"
import type { ComponentPropsWithoutRef } from "react"

export type SelectFieldOption = {
  label: string
  value: string
}

export type SelectFieldProps = {
  id?: string
  label: string
  optional?: boolean
  error?: string
  placeholder?: string
  options: SelectFieldOption[]
} & Omit<ComponentPropsWithoutRef<typeof Select>, "children">

export const SelectField = ({
  id,
  label,
  optional,
  error,
  placeholder,
  options,
  ...props
}: SelectFieldProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-x-1">
        <Label htmlFor={id} size="small">
          {label}
        </Label>
        {optional && (
          <Text size="small" leading="compact" className="text-ui-fg-muted">
            (Optional)
          </Text>
        )}
      </div>
      <Select {...props}>
        <Select.Trigger id={id}>
          <Select.Value placeholder={placeholder} />
        </Select.Trigger>
        <Select.Content>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      {error && <Hint variant="error">{error}</Hint>}
    </div>
  )
}
