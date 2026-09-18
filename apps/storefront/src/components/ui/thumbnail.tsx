import { cva, type VariantProps } from "class-variance-authority"
import Image from "next/image"
import { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { RiImageLine } from "@remixicon/react"

const thumbnailVariants = cva(
  "relative w-full overflow-hidden rounded-2xl bg-card",
  {
    variants: {
      ratio: {
        portrait: "aspect-3/4",
        square: "aspect-square",
      },
    },
    defaultVariants: {
      ratio: "portrait",
    },
  },
)

function Thumbnail({
  src,
  alt = "",
  ratio,
  className,
  ...props
}: ComponentProps<"div"> &
  VariantProps<typeof thumbnailVariants> & {
    src?: string | null
    alt?: string
  }) {
  return (
    <div
      data-slot="thumbnail"
      className={cn(thumbnailVariants({ ratio }), className)}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          draggable={false}
          quality={50}
          sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
          className="object-cover object-center mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <RiImageLine className="size-6" />
        </div>
      )}
    </div>
  )
}

export { Thumbnail, thumbnailVariants }
