"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ComponentProps, ReactElement, ReactNode } from "react"

type TextTooltipProps = {
  content: ReactNode
  children: ReactElement
} & ComponentProps<typeof Tooltip>

export function TextTooltip({ content, children, ...props }: TextTooltipProps) {
  return (
    <Tooltip {...props}>
      <TooltipTrigger render={children} />
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  )
}
