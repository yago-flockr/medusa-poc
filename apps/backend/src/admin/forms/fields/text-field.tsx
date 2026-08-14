import { forwardRef, type ComponentPropsWithoutRef } from "react"
import { Hint, Input, Label, Text } from "@medusajs/ui"

export type TextFieldProps = {
  label: string
  optional?: boolean
  error?: string
} & Omit<ComponentPropsWithoutRef<typeof Input>, "size">

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ id, label, optional, error, ...inputProps }, ref) {
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
        <Input id={id} ref={ref} {...inputProps} />
        {error && <Hint variant="error">{error}</Hint>}
      </div>
    )
  }
)
