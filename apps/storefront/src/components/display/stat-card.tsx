import { DataState } from "@/components/display/data-state"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
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
  ...props
}: StatCardProps) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
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
