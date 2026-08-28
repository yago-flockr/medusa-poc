"use client"

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import { RiCloseLine } from "@remixicon/react"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Sheet(props: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetContent({
  className,
  children,
  side = "left",
  ...props
}: DrawerPrimitive.Popup.Props & { side?: "left" | "right" }) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Backdrop
        data-slot="sheet-backdrop"
        className="fixed inset-0 z-50 bg-black/50"
      />
      <DrawerPrimitive.Viewport
        data-slot="sheet-viewport"
        className={cn(
          "fixed inset-y-0 z-50",
          side === "left" ? "left-0" : "right-0",
        )}
      >
        <DrawerPrimitive.Popup
          data-slot="sheet-content"
          className={cn(
            "flex h-full w-full max-w-xs flex-col gap-4 border bg-background p-6 shadow-lg",
            className,
          )}
          {...props}
        >
          <DrawerPrimitive.Close
            data-slot="sheet-close-icon"
            className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RiCloseLine size={18} />
            <span className="sr-only">Close</span>
          </DrawerPrimitive.Close>
          {children}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function SheetTitle(props: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="sheet-title"
      className="text-lg font-semibold"
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
}
