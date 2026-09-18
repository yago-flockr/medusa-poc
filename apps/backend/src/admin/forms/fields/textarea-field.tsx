import { Hint, Label, Text, Textarea } from "@medusajs/ui"
import { forwardRef, type ComponentPropsWithoutRef } from "react"

export type TextareaFieldProps = {
  label: string
  optional?: boolean
  error?: string
} & ComponentPropsWithoutRef<typeof Textarea>

export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(function TextareaField({ id, label, optional, error, ...props }, ref) {
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
      <Textarea id={id} ref={ref} {...props} />
      {error && <Hint variant="error">{error}</Hint>}
    </div>
  )
})
