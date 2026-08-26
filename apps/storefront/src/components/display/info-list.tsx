import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

function InfoListRoot({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />
}

function InfoListRow({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 text-sm",
        className,
      )}
      {...props}
    />
  )
}

function InfoListLabel({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("text-muted-foreground", className)} {...props} />
}

function InfoListText({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("font-medium", className)} {...props} />
}

function InfoListLink({ className, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "font-medium text-primary underline-offset-4 hover:underline",
        className,
      )}
      {...props}
    />
  )
}

export const InfoList = {
  Root: InfoListRoot,
  Row: InfoListRow,
  Label: InfoListLabel,
  Text: InfoListText,
  Link: InfoListLink,
}
