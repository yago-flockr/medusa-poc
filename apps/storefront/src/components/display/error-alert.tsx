import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type ErrorAlertProps = {
  title?: string
  description?: string
} & Omit<ComponentProps<typeof Alert>, "variant" | "children">

export function ErrorAlert({
  title = "Something went wrong",
  description = "An error occurred. Please try again.",
  className,
  ...props
}: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={cn("mt-4", className)} {...props}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}
