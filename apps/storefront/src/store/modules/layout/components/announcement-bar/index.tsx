import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

export default function AnnouncementBar({
  className,
  ...props
}: ComponentProps<"aside">) {
  return (
    <aside
      className={cn(
        "w-full bg-primary p-3 text-center text-xs uppercase tracking-widest text-primary-foreground",
        className,
      )}
      {...props}
    >
      Complimentary white-glove courier on all bespoke curation orders.
    </aside>
  )
}
