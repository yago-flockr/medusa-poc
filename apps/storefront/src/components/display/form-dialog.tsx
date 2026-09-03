import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ComponentProps, ReactNode } from "react"

type FormDialogProps = {
  title: string
  description?: string
  children: ReactNode
} & Omit<ComponentProps<typeof Dialog>, "children">

export function FormDialog({
  title,
  description,
  children,
  ...props
}: FormDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {props.open ? children : null}
      </DialogContent>
    </Dialog>
  )
}
