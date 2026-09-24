import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

import Image from "next/image"

export default function ManifestoHeader({
  className,
  ...props
}: ComponentProps<"section">) {
  return (
    <section className={cn("flex flex-col gap-12", className)} {...props}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <span className="text-xs uppercase tracking-widest text-primary">
          Provenance &amp; philosophy
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl">
          Invited, not applied.
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Anyone can buy here. Almost no one gets to sell. Every house in the
          catalog is invited by us, and one standard is held against all of
          them.
        </p>
      </div>
      <figure className="flex flex-col gap-3">
        <div className="relative aspect-21/9 w-full overflow-hidden rounded-2xl bg-card">
          <Image
            src="/editorial/atelier-studio.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <figcaption className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            The cutting room
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Independent houses, reviewed one at a time
          </span>
        </figcaption>
      </figure>
    </section>
  )
}
