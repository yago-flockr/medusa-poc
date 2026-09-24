import { DataState } from "@/components/display/data-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ComponentProps, ReactNode } from "react"

type StatCardProps = ComponentProps<typeof Card> & {
  title: string
  value: ReactNode
  isLoading?: boolean
}

export function StatCard({
  title,
  value,
  isLoading = false,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <DataState isLoading={isLoading}>
          <DataState.Loading />
          <DataState.Content>
            <p className="text-2xl font-semibold">{value}</p>
          </DataState.Content>
        </DataState>
      </CardContent>
    </Card>
  )
}
