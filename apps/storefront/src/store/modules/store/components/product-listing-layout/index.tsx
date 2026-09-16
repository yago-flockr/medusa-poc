import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

const ProductListingLayoutRoot = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div className={cn("container flex flex-col gap-8", className)} {...props} />
)

export const ProductListingLayout = {
  Root: ProductListingLayoutRoot,
}
