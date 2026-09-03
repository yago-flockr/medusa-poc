import { forwardRef, type ComponentPropsWithoutRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export type TextareaFieldProps = {
  label: string
  error?: string
} & ComponentPropsWithoutRef<typeof Textarea>

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function TextareaField({ id, label, error, ...props }, ref) {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Textarea id={id} ref={ref} aria-invalid={Boolean(error)} {...props} />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  },
)
