import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { RiCheckLine } from "@remixicon/react"
import type { ComponentProps } from "react"

export type Step = {
  label: string
  state: "done" | "current" | "upcoming"
}

export type StepsProps = {
  steps: Step[]
} & ComponentProps<"div">

const badgeVariantByState = {
  done: "default",
  current: "outline",
  upcoming: "muted",
} as const

export function Steps({ steps, className, ...props }: StepsProps) {
  return (
    <div className={cn("flex items-start", className)} {...props}>
      {steps.map((step, index) => (
        <div
          key={step.label}
          className="flex flex-1 items-center gap-2 last:flex-none"
        >
          <div className="flex flex-col items-center gap-1">
            <Badge variant={badgeVariantByState[step.state]}>
              {step.state === "done" ? <RiCheckLine /> : index + 1}
            </Badge>
            <span
              className={cn(
                "text-center text-xs whitespace-nowrap",
                step.state === "upcoming" && "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && <Separator className="flex-1" />}
        </div>
      ))}
    </div>
  )
}
