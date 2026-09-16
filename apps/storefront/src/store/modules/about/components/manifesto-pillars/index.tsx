import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

import { Eyebrow } from "@/components/ui/eyebrow"

const PILLARS = [
  {
    label: "Provenance",
    title: "We know who made it",
    description:
      "Every product belongs to a named house with a real address, a real inventory and a person accountable for it.",
  },
  {
    label: "Restraint",
    title: "A short catalog on purpose",
    description:
      "Houses are approved one at a time. We would rather list fewer pieces than list something we have not looked at.",
  },
  {
    label: "Permanence",
    title: "One standard, held",
    description:
      "A basket can cross several houses, settle in one payment, and still be measured against the same standard.",
  },
]

export default function ManifestoPillars({
  className,
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "grid grid-cols-1 gap-10 border-t pt-12 sm:grid-cols-3 sm:gap-8",
        className,
      )}
      {...props}
    >
      {PILLARS.map((pillar, index) => (
        <div key={pillar.label} className="flex flex-col gap-4">
          <Eyebrow variant="accent">
            {String(index + 1).padStart(2, "0")} / {pillar.label}
          </Eyebrow>
          <h2 className="font-heading text-xl">{pillar.title}</h2>
          <p className="text-sm text-muted-foreground">{pillar.description}</p>
        </div>
      ))}
    </section>
  )
}
