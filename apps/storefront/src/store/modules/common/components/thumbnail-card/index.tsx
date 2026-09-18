import Image from "next/image"

import { cn } from "@/lib/utils"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"

type ThumbnailCardProps = React.ComponentProps<typeof LocalizedClientLink> & {
  title: string
  subtitle?: string
  image?: string | null
}

export default function ThumbnailCard({
  title,
  subtitle,
  image,
  className,
  ...props
}: ThumbnailCardProps) {
  return (
    <LocalizedClientLink
      className={cn(
        "group relative flex aspect-square w-full flex-col justify-end overflow-hidden rounded-2xl",
        className,
      )}
      {...props}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-foreground to-foreground/70 transition-transform duration-300 group-hover:scale-105" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
      <div className="relative z-10 p-4">
        <p className="font-heading text-xl text-background">{title}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-background/80">{subtitle}</p>
        )}
      </div>
    </LocalizedClientLink>
  )
}
