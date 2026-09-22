import { TextTooltip } from "@/components/display/text-tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Item, ItemActions, ItemGroup, ItemTitle } from "@/components/ui/item"
import { cn } from "@/lib/utils"
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiDeleteBinLine,
} from "@remixicon/react"
import type { ComponentProps, ReactNode } from "react"

export type FieldArrayProps = {
  children: (index: number) => ReactNode
  disableAdd?: boolean
  error?: string
  label?: string
  onAdd: () => void
  onRemove: (index: number) => void
  onMoveUp?: (index: number) => void
  onMoveDown?: (index: number) => void
  values: unknown[]
} & Omit<ComponentProps<"div">, "children">

export function FieldArray({
  children,
  disableAdd,
  error,
  label = "Item",
  onAdd,
  onRemove,
  onMoveUp,
  onMoveDown,
  values,
  className,
  ...props
}: FieldArrayProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {values.length === 0 && (
        <Alert>
          <AlertTitle>Nothing here yet</AlertTitle>
          <AlertDescription>
            Add {label.toLowerCase()} to get started.
          </AlertDescription>
        </Alert>
      )}
      <ItemGroup>
        {values.map((_, index) => (
          <Item
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            variant="outline"
            className="flex-col items-stretch gap-2"
          >
            <div className="flex items-center justify-between gap-2">
              <ItemTitle>
                {label} {index + 1}
              </ItemTitle>
              <ItemActions>
                {onMoveUp && (
                  <TextTooltip content="Move up">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => onMoveUp(index)}
                    >
                      <RiArrowUpLine />
                    </Button>
                  </TextTooltip>
                )}
                {onMoveDown && (
                  <TextTooltip content="Move down">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Move down"
                      disabled={index === values.length - 1}
                      onClick={() => onMoveDown(index)}
                    >
                      <RiArrowDownLine />
                    </Button>
                  </TextTooltip>
                )}
                <TextTooltip content="Remove option">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Remove option"
                    onClick={() => onRemove(index)}
                  >
                    <RiDeleteBinLine />
                  </Button>
                </TextTooltip>
              </ItemActions>
            </div>
            {children(index)}
          </Item>
        ))}
      </ItemGroup>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disableAdd}
        onClick={onAdd}
      >
        <RiAddLine />
        Add {label.toLowerCase()}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
