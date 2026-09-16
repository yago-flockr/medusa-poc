import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

import ManifestoHeader from "@/store/modules/about/components/manifesto-header"
import ManifestoPillars from "@/store/modules/about/components/manifesto-pillars"
import ManifestoQuote from "@/store/modules/about/components/manifesto-quote"

export default function AboutTemplate({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("container flex flex-col gap-20", className)} {...props}>
      <ManifestoHeader />
      <ManifestoPillars />
      <ManifestoQuote />
    </div>
  )
}
