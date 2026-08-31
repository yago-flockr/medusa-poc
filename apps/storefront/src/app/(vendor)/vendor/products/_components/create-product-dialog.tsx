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
  createProductFormToInput,
  CreateProductForm,
  type CreateProductFormValues,
} from "@/vendor/forms/create-product-form"
import { useCreateProduct } from "@/vendor/hooks/mutations/products"
import { useUploadVendorImages } from "@/vendor/hooks/mutations/uploads"
import { RiAddLine } from "@remixicon/react"

type CreateProductDialogProps = {
  onCreated: () => void
}

export function CreateProductDialog({ onCreated }: CreateProductDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>()
  const uploadImages = useUploadVendorImages()
  const createProduct = useCreateProduct()

  const isLoading = uploadImages.isPending || createProduct.isPending

  const handleCreateProduct = async (values: CreateProductFormValues) => {
    setError(undefined)

    const files = values.images ? Array.from(values.images) : []
    const uploaded = files.length
      ? await uploadImages.mutateAsync(files).catch((err: Error) => {
          setError(err.message)
          return null
        })
      : { files: [] }

    if (!uploaded) return

    createProduct.mutate(createProductFormToInput(values, uploaded.files), {
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
          uploadImages.reset()
          createProduct.reset()
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
          <DialogTitle>Create product</DialogTitle>
        </DialogHeader>
        <CreateProductForm
          isLoading={isLoading}
          error={error}
          onSubmit={handleCreateProduct}
        />
      </DialogContent>
    </Dialog>
  )
}
