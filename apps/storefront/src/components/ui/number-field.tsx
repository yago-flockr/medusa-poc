"use client"

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { RiAddLine, RiSubtractLine } from "@remixicon/react"

import { cn } from "@/lib/utils"

function NumberField(props: NumberFieldPrimitive.Root.Props) {
  return <NumberFieldPrimitive.Root data-slot="number-field" {...props} />
}

function NumberFieldGroup({
  className,
  ...props
}: NumberFieldPrimitive.Group.Props) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={cn(
        "flex items-center rounded-2xl border border-transparent bg-input/50 transition-[color,box-shadow] duration-200 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-3 has-[[aria-invalid=true]]:ring-destructive/20",
        className,
      )}
      {...props}
    />
  )
}

function NumberFieldDecrement({
  className,
  ...props
}: NumberFieldPrimitive.Decrement.Props) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-decrement"
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground outline-none hover:bg-muted disabled:pointer-events-none disabled:opacity-50 rounded-full",
        className,
      )}
      {...props}
    >
      <RiSubtractLine size={14} />
    </NumberFieldPrimitive.Decrement>
  )
}

function NumberFieldIncrement({
  className,
  ...props
}: NumberFieldPrimitive.Increment.Props) {
  return (
    <NumberFieldPrimitive.Increment
      data-slot="number-field-increment"
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground outline-none hover:bg-muted disabled:pointer-events-none disabled:opacity-50 rounded-full",
        className,
      )}
      {...props}
    >
      <RiAddLine size={14} />
    </NumberFieldPrimitive.Increment>
  )
}

function NumberFieldInput({
  className,
  ...props
}: NumberFieldPrimitive.Input.Props) {
  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-input"
      className={cn(
        "h-8 w-full min-w-0 bg-transparent px-2.5 py-1 text-center text-base outline-none placeholder:text-muted-foreground md:text-sm",
        className,
      )}
      {...props}
    />
  )
}

export {
  NumberField,
  NumberFieldGroup,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
}
