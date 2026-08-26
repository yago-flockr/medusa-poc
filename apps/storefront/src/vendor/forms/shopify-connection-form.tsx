"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useSetVendorShopifyConnection } from "@/vendor/hooks/mutations/shopify"
import { useForm } from "react-hook-form"
import z from "zod"
import { Button } from "@/components/ui/button"
import { TextField } from "./fields/text-field"

export const shopifyConnectionSchema = z.object({
  shopify_store_domain: z.string().min(1),
  shopify_client_id: z.string().min(1),
  shopify_client_secret: z.string().min(1),
})

export type ShopifyConnectionInput = z.infer<typeof shopifyConnectionSchema>

export function ShopifyConnectionForm({
  defaultValues,
  onSaved,
}: {
  defaultValues?: {
    shopify_store_domain: string
    shopify_client_id: string
  }
  onSaved?: () => void
}) {
  const setVendorShopifyConnection = useSetVendorShopifyConnection()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShopifyConnectionInput>({
    resolver: zodResolver(shopifyConnectionSchema),
    defaultValues: {
      shopify_store_domain: defaultValues?.shopify_store_domain ?? "",
      shopify_client_id: defaultValues?.shopify_client_id ?? "",
      shopify_client_secret: "",
    },
  })

  const submit = handleSubmit((values) => {
    setVendorShopifyConnection.mutate(values, { onSuccess: onSaved })
  })

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <TextField
        id="shopify-store-domain"
        label="Store domain"
        placeholder="your-store.myshopify.com"
        error={errors.shopify_store_domain?.message}
        {...register("shopify_store_domain")}
      />
      <TextField
        id="shopify-client-id"
        label="Client ID"
        error={errors.shopify_client_id?.message}
        {...register("shopify_client_id")}
      />
      <TextField
        id="shopify-client-secret"
        label="Client secret"
        type="password"
        error={errors.shopify_client_secret?.message}
        {...register("shopify_client_secret")}
      />
      <Button type="submit" disabled={setVendorShopifyConnection.isPending}>
        {setVendorShopifyConnection.isPending ? "Saving…" : "Save"}
      </Button>
      {setVendorShopifyConnection.isError && (
        <p className="text-sm text-destructive">
          {setVendorShopifyConnection.error.message}
        </p>
      )}
    </form>
  )
}
