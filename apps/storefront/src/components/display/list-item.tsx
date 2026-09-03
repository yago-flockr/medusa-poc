import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

function ListItemRoot({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      className={cn(
        "flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm",
        className,
      )}
      {...props}
    />
  )
}

function ListItemGroup({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />
}

function ListItemTitle({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("font-medium", className)} {...props} />
}

function ListItemDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export const ListItem = {
  Root: ListItemRoot,
  Group: ListItemGroup,
  Title: ListItemTitle,
  Description: ListItemDescription,
}
