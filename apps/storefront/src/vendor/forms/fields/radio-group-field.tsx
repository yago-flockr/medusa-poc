import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

export type RadioGroupFieldOption = {
  value: string
  label: string
}

export type RadioGroupFieldProps = {
  label: string
  error?: string
  value: string
  onValueChange: (value: string) => void
  options: RadioGroupFieldOption[]
  className?: string
}

export function RadioGroupField({
  label,
  error,
  value,
  onValueChange,
  options,
  className,
}: RadioGroupFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{label}</p>
      <RadioGroup
        value={value}
        onValueChange={(next) => onValueChange(next as string)}
        className={cn("flex-row flex-wrap gap-4", className)}
      >
        {options.map((option) => (
          <Label
            key={option.value}
            className="flex items-center gap-2 capitalize"
          >
            <RadioGroupItem value={option.value} />
            {option.label}
          </Label>
        ))}
      </RadioGroup>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
