import { Badge } from "@/components/ui/badge"
import { Item } from "@/components/ui/item"
import { TextField } from "./text-field"

export type ProductVariantFieldsValue = {
  price: string
  sku: string
  weight: string
}

type ProductVariantFieldsCardProps = {
  idPrefix: string
  label: string
  value: ProductVariantFieldsValue
  onChange: (field: keyof ProductVariantFieldsValue, value: string) => void
}

export function ProductVariantFieldsCard({
  idPrefix,
  label,
  value,
  onChange,
}: ProductVariantFieldsCardProps) {
  return (
    <Item variant="outline" className="flex-col items-stretch gap-2">
      <Badge className="w-fit">{label}</Badge>
      <div className="flex gap-2">
        <TextField
          id={`${idPrefix}-price`}
          label="Price"
          type="number"
          min={0}
          step="0.01"
          value={value.price}
          onChange={(event) => onChange("price", event.target.value)}
          className="flex-1"
        />
        <TextField
          id={`${idPrefix}-sku`}
          label="SKU"
          value={value.sku}
          onChange={(event) => onChange("sku", event.target.value)}
          className="flex-1"
        />
        <TextField
          id={`${idPrefix}-weight`}
          label="Weight (g)"
          type="number"
          min={0}
          value={value.weight}
          onChange={(event) => onChange("weight", event.target.value)}
          className="flex-1"
        />
      </div>
    </Item>
  )
}
