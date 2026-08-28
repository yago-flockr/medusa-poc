import { HttpTypes } from "@medusajs/types"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  return (
    <span
      data-testid={dataTestid}
      data-value={dataValue}
      className="inline-block w-full overflow-hidden text-ellipsis text-sm text-muted-foreground"
    >
      Variant: {variant?.title}
    </span>
  )
}

export default LineItemOptions
