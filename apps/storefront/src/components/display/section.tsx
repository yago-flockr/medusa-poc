import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { ComponentProps, ReactNode } from "react"

interface SectionProps extends ComponentProps<typeof CardContent> {
  title: string
  description?: ReactNode
  action?: ReactNode
}

export function Section({
  title,
  description,
  action,
  children,
  ...props
}: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <Separator />
      {children && <CardContent {...props}>{children}</CardContent>}
    </Card>
  )
}
