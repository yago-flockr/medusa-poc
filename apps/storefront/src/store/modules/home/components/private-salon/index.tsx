import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Eyebrow } from "@/components/ui/eyebrow"

export default function PrivateSalon({
  className,
  ...props
}: ComponentProps<"section">) {
  return (
    <section className={cn("dark bg-background", className)} {...props}>
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <div className="max-w-xl flex flex-col gap-4">
            <Eyebrow variant="accent">Mobile protocol</Eyebrow>
            <h2 className="font-heading text-3xl text-foreground sm:text-4xl">
              Private client salon &amp; mobile concierge
            </h2>
            <p className="text-sm text-muted-foreground">
              Access 1:1 bespoke sartorial styling, priority allocation for
              numbered editions, and private fitting appointments.
            </p>
            <InputGroup>
              <InputGroupInput
                type="email"
                placeholder="salon.inquiry@client.com"
                aria-label="Email address"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton>Request entry</InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </div>
    </section>
  )
}
