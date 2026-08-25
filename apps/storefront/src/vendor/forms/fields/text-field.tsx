import { forwardRef, type ComponentPropsWithoutRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type TextFieldProps = {
  label: string
  error?: string
} & ComponentPropsWithoutRef<typeof Input>

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ id, label, error, ...props }, ref) {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Input id={id} ref={ref} aria-invalid={Boolean(error)} {...props} />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  },
)
