"use client"

import { Button } from "@/components/ui/button"
import { RiMoonLine, RiSunLine } from "@remixicon/react"
import { useTheme } from "next-themes"
import { useEffect, useState, type ComponentProps } from "react"

type ThemeToggleProps = Omit<
  ComponentProps<typeof Button>,
  "onClick" | "children"
>

export function ThemeToggle({
  variant = "outline",
  size = "icon-sm",
  ...props
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      {...props}
    >
      {mounted && resolvedTheme === "dark" ? <RiSunLine /> : <RiMoonLine />}
    </Button>
  )
}
