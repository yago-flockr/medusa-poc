import { Label } from "@/components/ui/label"
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field"

export type NumberFieldControlProps = {
  id: string
  label: string
  error?: string
  value: number | undefined
  onValueChange: (value: number | null) => void
  min?: number
  step?: number
}

export function NumberFieldControl({
  id,
  label,
  error,
  value,
  onValueChange,
  min,
  step,
}: NumberFieldControlProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <NumberField
        id={id}
        value={value ?? null}
        onValueChange={onValueChange}
        min={min}
        step={step}
      >
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput aria-invalid={Boolean(error)} />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
