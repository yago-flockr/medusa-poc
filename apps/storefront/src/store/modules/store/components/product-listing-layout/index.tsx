import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

type ProductListingLayoutRootProps = ComponentProps<"div">

const ProductListingLayoutRoot = ({
  className,
  ...props
}: ProductListingLayoutRootProps) => (
  <div className={cn("container py-6", className)} {...props} />
)

type ProductListingLayoutHeroProps = ComponentProps<"div">

const ProductListingLayoutHero = ({
  className,
  ...props
}: ProductListingLayoutHeroProps) => (
  <div className={cn("mb-8", className)} {...props} />
)

export const ProductListingLayout = {
  Root: ProductListingLayoutRoot,
  Hero: ProductListingLayoutHero,
}
