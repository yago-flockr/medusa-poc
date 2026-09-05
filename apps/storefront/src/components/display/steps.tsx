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

export function Steps({ steps, className, ...props }: StepsProps) {
  return (
    <div className={cn("flex items-start", className)} {...props}>
      {steps.map((step, index) => (
        <div
          key={step.label}
          className="flex flex-1 items-center last:flex-none"
        >
          <div className="flex flex-col items-center gap-1">
            <Badge
              className={cn(
                "size-6 rounded-full p-0",
                step.state === "upcoming" && "opacity-40",
              )}
              variant={step.state === "done" ? "default" : "outline"}
            >
              {step.state === "done" ? <RiCheckLine size={14} /> : index + 1}
            </Badge>
            <span
              className={cn(
                "text-center text-xs whitespace-nowrap",
                step.state === "upcoming" && "opacity-40",
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <Separator
              className={cn(
                "mx-2 flex-1",
                step.state !== "done" && "opacity-40",
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
