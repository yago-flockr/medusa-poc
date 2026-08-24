import { clx, Text } from "@medusajs/ui"
import { ComponentProps, forwardRef } from "react"

export type DividerProps = {
  orientation?: "horizontal" | "vertical"
} & ComponentProps<"div">

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  function Divider(
    { className, children, orientation = "horizontal", ...props },
    ref,
  ) {
    return (
      <div
        className={clx("flex items-center justify-center", className)}
        ref={ref}
        {...props}
      >
        <div
          className={clx(
            "border-ui-border",
            orientation === "horizontal" && "w-full border-t",
            orientation === "vertical" && "h-full border-r",
          )}
        />
        {children && (
          <Text size="small" className="text-ui-fg-subtle mx-2">
            {children}
          </Text>
        )}
        <div
          className={clx(
            "border-ui-border",
            orientation === "horizontal" && "w-full border-t",
            orientation === "vertical" && "h-full border-r",
          )}
        />
      </div>
    )
  },
)
