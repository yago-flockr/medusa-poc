"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { VendorIntegrationConnection } from "@dtc/api-contracts/vendor/integration-connection"
import type { PatchVendorsMeShopifyConnectionInput } from "@dtc/api-contracts/vendor/shopify-connection"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { TextField } from "./fields/text-field"
import type { CommonFormProps } from "./form-type"

export const shopifyConnectionSchema = z.object({
  shopify_store_domain: z.string().min(1, "Store domain is required"),
  shopify_client_id: z.string().min(1, "Client ID is required"),
  shopify_client_secret: z.string().min(1, "Client secret is required"),
})

export type ShopifyConnectionSchema = z.infer<typeof shopifyConnectionSchema>

type ShopifyConnectionFormProps = CommonFormProps<ShopifyConnectionSchema>

export function shopifyConnectionFormToInput(
  values: ShopifyConnectionSchema,
): PatchVendorsMeShopifyConnectionInput {
  return {
    shopify_store_domain: values.shopify_store_domain,
    shopify_client_id: values.shopify_client_id,
    shopify_client_secret: values.shopify_client_secret,
  }
}

export function shopifyConnectionInputToForm(
  connection: Pick<
    VendorIntegrationConnection,
    "external_account_identifier" | "client_id"
  >,
): ShopifyConnectionSchema {
  return {
    shopify_store_domain: connection.external_account_identifier ?? "",
    shopify_client_id: connection.client_id ?? "",
    shopify_client_secret: "",
  }
}

export function ShopifyConnectionForm({
  defaultValues,
  isLoading,
  onSubmit,
  className,
  ...props
}: ShopifyConnectionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShopifyConnectionSchema>({
    resolver: zodResolver(shopifyConnectionSchema),
    defaultValues: {
      shopify_store_domain: "",
      shopify_client_id: "",
      shopify_client_secret: "",
      ...defaultValues,
    },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit?.(values))}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
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
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Connecting…" : "Connect to Shopify"}
      </Button>
    </form>
  )
}
