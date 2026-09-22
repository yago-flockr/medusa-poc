"use client"

import { Section } from "@/components/display/section"
import {
  useDeleteAffiliatesProduct,
  usePostAffiliatesProducts,
} from "@/affiliate/hooks/mutations/products"
import { useGetAffiliatesMe } from "@/affiliate/hooks/queries/me"
import { useGetAffiliatesProducts } from "@/affiliate/hooks/queries/products"
import { useGetStoreProducts } from "@/affiliate/hooks/queries/store-products"
import { DataState } from "@/components/display/data-state"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { toast } from "sonner"

export default function AffiliateProductsPage() {
  const [selectedProductId, setSelectedProductId] = useState<string>("")

  const getAffiliatesMe = useGetAffiliatesMe()
  const getAffiliatesProducts = useGetAffiliatesProducts()
  const getStoreProducts = useGetStoreProducts()
  const postAffiliatesProducts = usePostAffiliatesProducts()
  const deleteAffiliatesProduct = useDeleteAffiliatesProduct()

  const promoted = getAffiliatesProducts.data?.products ?? []
  const promotedIds = new Set(promoted.map((product) => product.id))
  const available = (getStoreProducts.data?.products ?? []).filter(
    (product) => !promotedIds.has(product.id),
  )

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
        <div className="flex items-center gap-2">
          <Select
            value={selectedProductId}
            onValueChange={(value) => setSelectedProductId(String(value))}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Pick a product" />
            </SelectTrigger>
            <SelectContent>
              {available.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            disabled={!selectedProductId || postAffiliatesProducts.isPending}
            onClick={() =>
              postAffiliatesProducts.mutate(
                { product_id: selectedProductId },
                { onSuccess: () => setSelectedProductId("") },
              )
            }
          >
            Promote
          </Button>
        </div>
      }
    >
      <DataState
        isLoading={getAffiliatesProducts.isLoading}
        isEmpty={promoted.length === 0}
      >
        <DataState.Loading />
        <DataState.Empty>You are not promoting anything yet.</DataState.Empty>
        <DataState.Content>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoted.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.title}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyShareLink(product.handle)}
                    >
                      Copy link
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={deleteAffiliatesProduct.isPending}
                      onClick={() => deleteAffiliatesProduct.mutate(product.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState.Content>
      </DataState>
    </Section>
  )
}
