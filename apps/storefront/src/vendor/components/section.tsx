import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ComponentProps, ReactNode } from "react"

interface VendorSectionProps extends ComponentProps<typeof CardContent> {
  title: string
  description?: ReactNode
  action?: ReactNode
}

export function VendorSection({
  title,
  description,
  action,
  children,
  ...props
}: VendorSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      {children && <CardContent {...props}>{children}</CardContent>}
    </Card>
  )
}
