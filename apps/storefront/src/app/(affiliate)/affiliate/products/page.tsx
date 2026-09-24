"use client"

import { Section } from "@/components/display/section"
import { TextTooltip } from "@/components/display/text-tooltip"
import {
  useDeleteAffiliatesProduct,
  usePostAffiliatesProducts,
} from "@/affiliate/hooks/mutations/products"
import { useGetAffiliatesMe } from "@/affiliate/hooks/queries/me"
import { useGetAffiliatesProducts } from "@/affiliate/hooks/queries/products"
import { DataState } from "@/components/display/data-state"
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
import type { AffiliateProduct } from "@dtc/api-contracts/affiliate/products"
import { RiDeleteBinLine, RiLinksLine } from "@remixicon/react"
import { useState } from "react"
import { toast } from "sonner"
import { AddProductDialog } from "./_components/add-product-dialog"

export default function AffiliateProductsPage() {
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const getAffiliatesMe = useGetAffiliatesMe()
  const getAffiliatesProducts = useGetAffiliatesProducts()
  const postAffiliatesProducts = usePostAffiliatesProducts()
  const deleteAffiliatesProduct = useDeleteAffiliatesProduct()

  const promoted = getAffiliatesProducts.data?.products ?? []
  const promotedIds = new Set(promoted.map((product) => product.id))

  const handle = getAffiliatesMe.data?.affiliate.handle

  const copyShareLink = (productHandle: string) => {
    const link = `${window.location.origin}/gb/products/${productHandle}?ref=${handle}`
    navigator.clipboard.writeText(link)
    toast.success("Share link copied")
  }

  return (
    <Section
      title="Products"
      description="The products you promote. Copy a link to share it with your audience."
      action={
        <Button type="button" onClick={() => setIsPickerOpen(true)}>
          Promote
        </Button>
      }
    >
      <DataState
        isLoading={getAffiliatesProducts.isLoading}
        isEmpty={promoted.length === 0}
      >
        <DataState.Loading />
        <DataState.Empty>You are not promoting anything yet.</DataState.Empty>
        <DataState.Content>
          <ItemGroup>
            {promoted.map((product: AffiliateProduct) => (
              <Item key={product.id} variant="outline">
                {product.thumbnail && (
                  <ItemMedia variant="image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.thumbnail} alt="" />
                  </ItemMedia>
                )}
                <ItemContent>
                  <ItemTitle>{product.title}</ItemTitle>
                  {product.vendor_name && (
                    <ItemDescription>{product.vendor_name}</ItemDescription>
                  )}
                </ItemContent>
                <ItemActions>
                  <TextTooltip content="Copy share link">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Copy share link"
                      onClick={() => copyShareLink(product.handle)}
                    >
                      <RiLinksLine />
                    </Button>
                  </TextTooltip>
                  <TextTooltip content="Stop promoting">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Stop promoting"
                      disabled={deleteAffiliatesProduct.isPending}
                      onClick={() => deleteAffiliatesProduct.mutate(product.id)}
                    >
                      <RiDeleteBinLine />
                    </Button>
                  </TextTooltip>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </DataState.Content>
      </DataState>

      <AddProductDialog
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        promotedIds={promotedIds}
        isAdding={postAffiliatesProducts.isPending}
        onAdd={(productId) =>
          postAffiliatesProducts.mutate(
            { product_id: productId },
            { onSuccess: () => setIsPickerOpen(false) },
          )
        }
      />
    </Section>
  )
}
