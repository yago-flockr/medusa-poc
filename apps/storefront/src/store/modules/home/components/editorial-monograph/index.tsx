import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Eyebrow } from "@/components/ui/eyebrow"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { RiArrowRightLine } from "@remixicon/react"

const STATS = [
  { value: "14.8 µm", label: "Fibre fineness" },
  { value: "480 gsm", label: "Thermal weight" },
  { value: "100%", label: "Natural fibres" },
]

export default function EditorialMonograph() {
  return (
    <section className="bg-muted">
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative aspect-4/3 w-full overflow-hidden">
            <Image
              src="/editorial/monograph-detail.png"
              alt=""
              fill
              className="object-cover object-center"
            />
          </div>
          <div className="flex flex-col gap-6">
            <Eyebrow variant="accent">Archival monograph</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-4xl">
              The art of unlined weightlessness
            </h2>
            <p className="text-sm text-muted-foreground">
              Traditional tailoring relies on layers of stiff interlinings and
              horsehair canvas. Our partnered houses engineer structure directly
              into the yarn itself.
            </p>
            <p className="text-sm text-muted-foreground">
              Using double-faced cashmere, master craftspeople hand-split every
              edge along seamlines, folding the margins inward and securing them
              with hours of invisible hand-stitching per garment.
            </p>
            <dl className="grid grid-cols-3 gap-6 border-t pt-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-2">
                  <dt className="font-heading text-2xl">{stat.value}</dt>
                  <dd>
                    <Eyebrow>{stat.label}</Eyebrow>
                  </dd>
                </div>
              ))}
            </dl>
            <Button
              variant="link"
              className="w-fit px-0"
              render={<LocalizedClientLink href="/store" />}
            >
              Read the complete fibre dissertation
              <RiArrowRightLine data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
