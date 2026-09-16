import Image from "next/image"

import { Eyebrow } from "@/components/ui/eyebrow"

export default function ManifestoHeader() {
  return (
    <section className="flex flex-col gap-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <Eyebrow variant="accent">Provenance &amp; philosophy</Eyebrow>
        <h1 className="font-heading text-4xl sm:text-5xl">Reviewed, not listed.</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Anyone can buy here. Almost no one gets to sell. Every house in the
          catalog is read, checked and approved before a single product goes
          live, and one standard is held against all of them.
        </p>
      </div>
      <figure className="flex flex-col gap-3">
        <div className="relative aspect-21/9 w-full overflow-hidden bg-card">
          <Image
            src="/editorial/atelier-studio.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <figcaption className="flex flex-wrap items-center justify-between gap-4">
          <Eyebrow>The cutting room</Eyebrow>
          <Eyebrow>Independent houses, reviewed one at a time</Eyebrow>
        </figcaption>
      </figure>
    </section>
  )
}
