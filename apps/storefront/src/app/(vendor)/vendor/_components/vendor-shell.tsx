"use client"

import { TextTooltip } from "@/components/display/text-tooltip"
import { ThemeToggle } from "@/components/display/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { RiRefreshLine } from "@remixicon/react"
import { useQueryClient } from "@tanstack/react-query"
import { ComponentProps } from "react"

import { VendorSidebar } from "./vendor-sidebar"

export function VendorShell({
  children,
  ...props
}: ComponentProps<typeof SidebarProvider>) {
  const queryClient = useQueryClient()

  return (
    <SidebarProvider {...props}>
      <VendorSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="flex flex-1 items-center justify-end gap-2">
            <ThemeToggle />
            <TextTooltip content="Refresh everything">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Refresh everything"
                onClick={() => {
                  queryClient.invalidateQueries()
                }}
                disabled={queryClient.isFetching() > 0}
              >
                <RiRefreshLine />
              </Button>
            </TextTooltip>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
