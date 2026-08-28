import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: string
  handleChange: (value: string) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex flex-col gap-y-3 gap-x-3">
      <span className="text-sm font-medium text-muted-foreground">
        {title}
      </span>
      <RadioGroup
        data-testid={dataTestId}
        value={value}
        onValueChange={(v) => handleChange(v as string)}
      >
        {items?.map((i) => (
          <div key={i.value} className="flex items-center gap-x-2">
            <RadioGroupItem value={i.value} id={i.value} />
            <Label
              htmlFor={i.value}
              className="cursor-pointer text-muted-foreground data-[active=true]:text-foreground"
              data-testid="radio-label"
              data-active={i.value === value}
            >
              {i.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
