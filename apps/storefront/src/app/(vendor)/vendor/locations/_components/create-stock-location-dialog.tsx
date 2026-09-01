"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  createStockLocationFormToInput,
  CreateStockLocationForm,
  type CreateStockLocationFormValues,
} from "@/vendor/forms/create-stock-location-form"
import { useCreateStockLocation } from "@/vendor/hooks/mutations/stock-locations"
import { RiAddLine } from "@remixicon/react"

type CreateStockLocationDialogProps = {
  onCreated: () => void
}

export function CreateStockLocationDialog({
  onCreated,
}: CreateStockLocationDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>()
  const createStockLocation = useCreateStockLocation()

  const handleCreate = (values: CreateStockLocationFormValues) => {
    setError(undefined)

    createStockLocation.mutate(createStockLocationFormToInput(values), {
      onSuccess: () => {
        setOpen(false)
        onCreated()
      },
      onError: (err) => setError(err.message),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setError(undefined)
          createStockLocation.reset()
        }
      }}
    >
      <DialogTrigger
        render={
          <Button type="button">
            <RiAddLine size={16} />
            Create
          </Button>
        }
      />
      <DialogContent className="max-w-lg gap-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create location</DialogTitle>
        </DialogHeader>
        <CreateStockLocationForm
          isLoading={createStockLocation.isPending}
          error={error}
          onSubmit={handleCreate}
        />
      </DialogContent>
    </Dialog>
  )
}
