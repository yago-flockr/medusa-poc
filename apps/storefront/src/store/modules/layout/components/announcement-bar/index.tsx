import { Eyebrow } from "@/components/ui/eyebrow"
import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

export default function AnnouncementBar({
  className,
  ...props
}: ComponentProps<"aside">) {
  return (
    <Eyebrow
      variant="inverted"
      render={<aside />}
      className={cn("block w-full bg-primary p-3 text-center", className)}
      {...props}
    >
      Complimentary white-glove courier on all bespoke curation orders.
    </Eyebrow>
  )
}
