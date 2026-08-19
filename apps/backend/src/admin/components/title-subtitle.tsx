import { clx, Heading, Text } from "@medusajs/ui"
import { ComponentProps, forwardRef } from "react"

export type TitleSubtitleProps = {
  title: string
  description?: string
} & ComponentProps<"div">

export const TitleSubtitle = forwardRef<HTMLDivElement, TitleSubtitleProps>(
  function FormTitle({ className, title, description, ...props }, ref) {
    return (
      <div className={clx("text-center", className)} ref={ref} {...props}>
        <Heading>{title}</Heading>
        {description && (
          <Text size="small" className="text-ui-fg-subtle">
            {description}
          </Text>
        )}
      </div>
    )
  },
)
