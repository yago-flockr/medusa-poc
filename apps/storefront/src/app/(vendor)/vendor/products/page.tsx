"use client"

import { DataState } from "@/components/display/data-state"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VendorSection } from "@/vendor/components/section"
import {
  useDeleteProduct,
  useUpdateProductStatus,
} from "@/vendor/hooks/mutations/products"
import { useGetProducts } from "@/vendor/hooks/queries/products"
import type {
  VendorProduct,
  VendorProductStatus,
} from "@dtc/api-contracts/vendor/products"
import { RiDeleteBinLine, RiLinksLine } from "@remixicon/react"
import { CreateProductDialog } from "./_components/create-product-dialog"

const STATUS_OPTIONS: VendorProductStatus[] = [
  "draft",
  "proposed",
  "published",
  "rejected",
]

export default function VendorProductsPage() {
  const getProducts = useGetProducts()
  const updateProductStatus = useUpdateProductStatus()
  const deleteProduct = useDeleteProduct()

  return (
    <VendorSection
      title="Products"
      description="View your catalogue, publish products yourself, or remove them. Anything synced from Shopify keeps its details in sync from there — this page only controls whether it's visible to customers."
      action={<CreateProductDialog onCreated={() => getProducts.refetch()} />}
      className="flex flex-col gap-3"
    >
      <DataState
        isLoading={getProducts.isLoading}
        isEmpty={getProducts.data?.products.length === 0}
      >
        <DataState.Loading />
        <DataState.Empty>
          <p className="text-sm text-muted-foreground">No products yet.</p>
        </DataState.Empty>
        <DataState.Content>
          <ul className="flex flex-col gap-2">
            {getProducts.data?.products.map((product: VendorProduct) => {
              const isUpdatingStatus =
                updateProductStatus.isPending &&
                updateProductStatus.variables?.id === product.id
              const isDeleting =
                deleteProduct.isPending &&
                deleteProduct.variables === product.id

              return (
                <li
                  key={product.id}
                  className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm"
                >
                  {product.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.thumbnail}
                      alt=""
                      className="size-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{product.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {product.variant_count} variant
                        {product.variant_count === 1 ? "" : "s"}
                      </span>
                      {product.external_id && (
                        <div className="flex items-center text-muted-foreground font-medium gap-1">
                          <RiLinksLine size={16} />
                          <span>Imported</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Select
                    value={product.status}
                    disabled={isUpdatingStatus}
                    onValueChange={(value) =>
                      updateProductStatus.mutate(
                        {
                          id: product.id,
                          status: value as VendorProductStatus,
                        },
                        { onSuccess: () => getProducts.refetch() },
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          disabled={isDeleting}
                        >
                          <RiDeleteBinLine />
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove product</AlertDialogTitle>
                        <AlertDialogDescription>
                          Remove &quot;{product.title}&quot;? This can&apos;t be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className={buttonVariants({ variant: "destructive" })}
                          onClick={() =>
                            deleteProduct.mutate(product.id, {
                              onSuccess: () => getProducts.refetch(),
                            })
                          }
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              )
            })}
          </ul>
          {updateProductStatus.isError && (
            <p className="text-sm text-destructive">
              {updateProductStatus.error.message}
            </p>
          )}
          {deleteProduct.isError && (
            <p className="text-sm text-destructive">
              {deleteProduct.error.message}
            </p>
          )}
        </DataState.Content>
      </DataState>
    </VendorSection>
  )
}
