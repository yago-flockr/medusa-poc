"use client"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import React from "react"
import { useFormStatus } from "react-dom"

export function SubmitButton({
  children,
  variant = "default",
  size = "default",
  className,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: "default" | "secondary" | "ghost" | null
  size?: "sm" | "default" | "lg"
  className?: string
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      size={size}
      className={className}
      type="submit"
      disabled={pending}
      variant={variant || "default"}
      data-testid={dataTestId}
    >
      {pending ? <Spinner /> : children}
    </Button>
  )
}
