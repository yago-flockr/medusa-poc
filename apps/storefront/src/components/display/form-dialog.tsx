import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ComponentProps } from "react"

type FormDialogProps = {
  title: string
  description?: string
  open: boolean
  onOpenChange: (open: boolean) => void
} & ComponentProps<typeof DialogContent>

export function FormDialog({
  title,
  description,
  open,
  onOpenChange,
  children,
  ...props
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent {...props}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
