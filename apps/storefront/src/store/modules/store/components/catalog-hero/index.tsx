import { cn } from "@/lib/utils"
import Image from "next/image"
import { ComponentProps } from "react"

type CatalogHeroProps = ComponentProps<"div"> & {
  title: string
  eyebrow?: string
  description?: string | null
  imageUrl?: string | null
  count?: number
  titleTestId?: string
}

const CatalogHero = ({
  title,
  eyebrow,
  description,
  imageUrl,
  count,
  titleTestId,
  className,
  ...props
}: CatalogHeroProps) => {
  if (imageUrl) {
    return (
      <div
        className={cn(
          "dark relative flex h-64 w-full items-end overflow-hidden rounded-2xl bg-background sm:h-80",
          className,
        )}
        {...props}
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
        <div className="relative z-10 flex flex-col gap-3 p-8">
          {eyebrow && (
            <span className="text-xs uppercase tracking-widest text-primary">
              {eyebrow}
            </span>
          )}
          <h1
            className="font-heading text-3xl text-foreground sm:text-4xl"
            data-testid={titleTestId}
          >
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-end justify-between gap-6",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-widest text-primary">
          {eyebrow ?? "Collection folio"}
        </span>
        <h1
          className="font-heading text-4xl sm:text-5xl"
          data-testid={titleTestId}
        >
          {title}
        </h1>
        {description && (
          <p className="max-w-xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {count !== undefined && (
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {count} {count === 1 ? "piece" : "pieces"}
        </span>
      )}
    </div>
  )
}

export default CatalogHero
