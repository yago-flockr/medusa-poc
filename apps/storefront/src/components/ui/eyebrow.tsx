import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const eyebrowVariants = cva("text-xs uppercase tracking-widest", {
  variants: {
    variant: {
      default: "text-muted-foreground",
      accent: "text-primary",
      foreground: "text-foreground",
      background: "text-background",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Eyebrow({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof eyebrowVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(eyebrowVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "eyebrow",
      variant,
    },
  })
}

export { Eyebrow, eyebrowVariants }
