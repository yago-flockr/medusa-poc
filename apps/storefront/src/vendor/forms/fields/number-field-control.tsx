import { Label } from "@/components/ui/label"
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field"
import { forwardRef, type ComponentPropsWithoutRef } from "react"

export type NumberControlFieldProps = {
  label: string
  error?: string
} & ComponentPropsWithoutRef<typeof NumberField>

export const NumberControlField = forwardRef<
  HTMLInputElement,
  NumberControlFieldProps
>(function NumberControlField({ id, label, error, ...props }, ref) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <NumberField id={id} {...props}>
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput ref={ref} aria-invalid={Boolean(error)} />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
})
