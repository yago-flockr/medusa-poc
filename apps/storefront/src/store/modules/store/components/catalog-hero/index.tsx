import { cn } from "@/lib/utils"
import Image from "next/image"
import { ComponentProps } from "react"

type CatalogHeroProps = ComponentProps<"div"> & {
  title: string
  description?: string | null
  imageUrl?: string | null
  titleTestId?: string
}

const CatalogHero = ({
  title,
  description,
  imageUrl,
  titleTestId,
  className,
  ...props
}: CatalogHeroProps) => {
  return (
    <div
      className={cn(
        "relative flex h-64 w-full items-end overflow-hidden rounded-lg sm:h-80",
        className,
      )}
      {...props}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-foreground to-foreground/70" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
      <div className="relative z-10 p-6 sm:p-8">
        <h1
          className="font-heading text-3xl text-background sm:text-4xl"
          data-testid={titleTestId}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-background/80 sm:text-base">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

export default CatalogHero
