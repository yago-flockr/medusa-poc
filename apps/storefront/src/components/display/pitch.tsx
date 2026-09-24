import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type PitchProps = ComponentProps<"div"> & {
  title: string
  description: string
  cards: { title: string; description: string }[]
}

export function Pitch({
  title,
  description,
  cards,
  className,
  ...props
}: PitchProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 border-b bg-muted/40 p-8 lg:border-r lg:border-b-0 lg:p-10",
        className,
      )}
      {...props}
    >
      <h1 className="font-heading text-3xl leading-tight sm:text-4xl">
        {title}
      </h1>
      <p className="text-muted-foreground">{description}</p>
      <div className="grid gap-5 max-md:hidden sm:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="flex flex-col gap-1.5">
            <h2 className="font-medium">{card.title}</h2>
            <p className="text-sm text-muted-foreground">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
