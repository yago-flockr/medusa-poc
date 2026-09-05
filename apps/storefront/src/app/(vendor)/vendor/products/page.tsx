"use client"

import { DataState } from "@/components/display/data-state"
import { FormDialog } from "@/components/display/form-dialog"
import { TextTooltip } from "@/components/display/text-tooltip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { VendorSection } from "@/vendor/components/section"
import {
  ProductInventoryForm,
  productInventoryFormToInput,
} from "@/vendor/forms/product-inventory-form"
import { ProductForm, productFormToInput } from "@/vendor/forms/product-form"
import {
  ProductEditForm,
  productEditFormToInput,
} from "@/vendor/forms/product-edit-form"
import { usePostVendorsProductsByIdInventory } from "@/vendor/hooks/mutations/product-inventory"
import {
  usePostVendorsProducts,
  usePostVendorsProductsById,
} from "@/vendor/hooks/mutations/products"
import { usePostVendorsUploads } from "@/vendor/hooks/mutations/uploads"
import { useGetVendorsProductsByIdInventory } from "@/vendor/hooks/queries/product-inventory"
import {
  useGetVendorsProducts,
  useGetVendorsProductsById,
} from "@/vendor/hooks/queries/products"
import type { VendorProduct } from "@dtc/api-contracts/vendor/products"
import { RiLinksLine, RiPencilLine, RiStackLine } from "@remixicon/react"
import { useState } from "react"
import { toast } from "sonner"

type ProductFormValues = { state: "CREATING" } | { state: "UPDATING"; id: string }

export default function VendorProductsPage() {
  const getVendorsProducts = useGetVendorsProducts()
  const [inventoryProductId, setInventoryProductId] = useState<string | null>(
    null,
  )
  const [formValues, setFormValues] = useState<ProductFormValues>()

  const getVendorsProductsByIdInventory = useGetVendorsProductsByIdInventory(
    inventoryProductId ?? "",
    { enabled: inventoryProductId !== null },
  )
  const getVendorsProductsById = useGetVendorsProductsById(
    formValues?.state === "UPDATING" ? formValues.id : "",
    { enabled: formValues?.state === "UPDATING" },
  )
  const postVendorsProductsByIdInventory = usePostVendorsProductsByIdInventory()
  const postVendorsProducts = usePostVendorsProducts()
  const postVendorsProductsById = usePostVendorsProductsById()
  const postVendorsUploads = usePostVendorsUploads()

  const inventory = getVendorsProductsByIdInventory.data
  const editingProduct = getVendorsProductsById.data?.product

  return (
    <VendorSection
      title="Products"
      description="View your catalogue, publish products yourself, or remove them. Anything synced from Shopify keeps its details in sync from there — this page only controls whether it's visible to customers."
      action={
        <Button
          size="sm"
          onClick={() => setFormValues({ state: "CREATING" })}
        >
          Create
        </Button>
      }
      className="flex flex-col gap-3"
    >
      <DataState
        isLoading={getVendorsProducts.isLoading}
        isEmpty={getVendorsProducts.data?.products.length === 0}
      >
        <DataState.Loading />
        <DataState.Empty>
          <p className="text-sm text-muted-foreground">No products yet.</p>
        </DataState.Empty>
        <DataState.Content>
          <ItemGroup>
            {getVendorsProducts.data?.products.map((product: VendorProduct) => (
              <Item key={product.id} variant="outline">
                {product.thumbnail && (
                  <ItemMedia variant="image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.thumbnail} alt="" />
                  </ItemMedia>
                )}
                <ItemContent>
                  <ItemTitle>{product.title}</ItemTitle>
                  <ItemDescription className="flex items-center gap-2">
                    <span>{product.variant_count} variants</span>
                    {product.external_id && (
                      <span className="flex items-center gap-1">
                        <RiLinksLine size={14} />
                        Imported
                      </span>
                    )}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Badge variant="muted">{product.status}</Badge>
                  <TextTooltip content="Edit product">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Edit product"
                      onClick={() =>
                        setFormValues({ state: "UPDATING", id: product.id })
                      }
                    >
                      <RiPencilLine />
                    </Button>
                  </TextTooltip>
                  <TextTooltip content="Manage inventory">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Manage inventory"
                      onClick={() => setInventoryProductId(product.id)}
                    >
                      <RiStackLine />
                    </Button>
                  </TextTooltip>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </DataState.Content>
      </DataState>

      <FormDialog
        title="Manage inventory"
        description="Set how many units of each variant are stocked at each location."
        open={inventoryProductId !== null}
        onOpenChange={(open) => {
          if (!open) setInventoryProductId(null)
        }}
      >
        <DataState isLoading={getVendorsProductsByIdInventory.isLoading}>
          <DataState.Loading />
          <DataState.Content>
            {inventory && (
              <ProductInventoryForm
                variants={inventory.variants}
                locations={inventory.locations}
                isLoading={postVendorsProductsByIdInventory.isPending}
                onSubmit={(values) => {
                  if (!inventoryProductId) return

                  Promise.all(
                    productInventoryFormToInput(values).map((level) =>
                      postVendorsProductsByIdInventory.mutateAsync({
                        productId: inventoryProductId,
                        ...level,
                      }),
                    ),
                  )
                    .then(() => {
                      toast.success("Inventory updated")
                      getVendorsProductsByIdInventory.refetch()
                    })
                    .catch(() => {
                      // already toasted by the global mutation error handler
                    })
                }}
              />
            )}
          </DataState.Content>
        </DataState>
      </FormDialog>

      <FormDialog
        title="Create product"
        description="Fill in every field you can — a variant missing SKU or weight stays a draft until it's complete."
        open={formValues?.state === "CREATING"}
        onOpenChange={(open) => {
          if (!open) setFormValues(undefined)
        }}
      >
        <ProductForm
          isLoading={postVendorsProducts.isPending}
          isUploadingImages={postVendorsUploads.isPending}
          onUploadImages={async (files) => {
            const result = await postVendorsUploads.mutateAsync(files)
            return result.files.map((file) => file.url)
          }}
          onSubmit={(values) => {
            postVendorsProducts.mutate(productFormToInput(values), {
              onSuccess: (response) => {
                toast.success(`Product created as ${response.product.status}`)
                getVendorsProducts.refetch()
                setFormValues(undefined)
              },
            })
          }}
        />
      </FormDialog>

      <FormDialog
        title="Edit product"
        open={formValues?.state === "UPDATING"}
        onOpenChange={(open) => {
          if (!open) setFormValues(undefined)
        }}
      >
        <DataState isLoading={getVendorsProductsById.isLoading}>
          <DataState.Loading />
          <DataState.Content>
            {editingProduct && (
              <ProductEditForm
                product={editingProduct}
                isLoading={postVendorsProductsById.isPending}
                isUploadingImages={postVendorsUploads.isPending}
                onUploadImages={async (files) => {
                  const result = await postVendorsUploads.mutateAsync(files)
                  return result.files.map((file) => file.url)
                }}
                onSubmit={(values) => {
                  if (formValues?.state !== "UPDATING") return

                  postVendorsProductsById.mutate(
                    {
                      id: formValues.id,
                      ...productEditFormToInput(
                        values,
                        Boolean(editingProduct.external_id),
                      ),
                    },
                    {
                      onSuccess: () => {
                        toast.success("Product updated")
                        getVendorsProducts.refetch()
                        setFormValues(undefined)
                      },
                    },
                  )
                }}
              />
            )}
          </DataState.Content>
        </DataState>
      </FormDialog>
    </VendorSection>
  )
}
