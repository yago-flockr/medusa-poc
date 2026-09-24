import { cn } from "@/lib/utils"
import type { ComponentProps, ReactNode } from "react"

type TitleDescriptionProps = ComponentProps<"div"> & {
  title: ReactNode
  description?: ReactNode
}

export function TitleDescription({
  title,
  description,
  className,
  ...props
}: TitleDescriptionProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      <h2 className="font-medium">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
