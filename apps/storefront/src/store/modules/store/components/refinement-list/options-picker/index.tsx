import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { HttpTypes } from "@medusajs/types"

type OptionsPickerProps = {
  options: HttpTypes.StoreProductOption[]
  selectedValueIds: string[]
  setOptionValueIds: (valueIds: string[]) => void
}

const OptionsPicker = ({
  options,
  selectedValueIds,
  setOptionValueIds,
}: OptionsPickerProps) => {
  if (!options.length) {
    return null
  }

  return (
    <Accordion className="border-none">
      {options.map((option) => {
        const values =
          option.values
            ?.map((value) => ({ id: value.id, label: value.value }))
            .filter(
              (value): value is { id: string; label: string } =>
                !!value.id && !!value.label,
            ) || []

        if (!values.length) {
          return null
        }

        const groupValueIds = values
          .map((value) => value.id)
          .filter((id) => selectedValueIds.includes(id))

        const handleGroupValueChange = (nextGroupValueIds: string[]) => {
          const otherValueIds = selectedValueIds.filter(
            (id) => !values.some((value) => value.id === id),
          )
          setOptionValueIds([...otherValueIds, ...nextGroupValueIds])
        }

        return (
          <AccordionItem key={option.id} value={option.id}>
            <AccordionTrigger>
              <span className="font-medium text-foreground">
                {option.title || "Option"}
              </span>
              {groupValueIds.length > 0 && (
                <span className="text-muted-foreground">
                  ({groupValueIds.length})
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <ToggleGroup
                multiple
                variant="outline"
                value={groupValueIds}
                onValueChange={handleGroupValueChange}
                className="flex-wrap"
              >
                {values.map((value) => (
                  <ToggleGroupItem key={value.id} value={value.id}>
                    {value.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

export default OptionsPicker
