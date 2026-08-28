"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  setVendorShopifyConnectionSchema,
  type SetVendorShopifyConnectionInput,
} from "@dtc/api-contracts/vendor/shopify-connection"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TextField } from "./fields/text-field"
import type { CommonFormProps } from "./form-type"

type ShopifyConnectionFormProps = CommonFormProps<SetVendorShopifyConnectionInput> & {
  submitLabel: string
  error?: string
  className?: string
}

export function ShopifyConnectionForm({
  defaultValues,
  isLoading,
  onSubmit,
  submitLabel,
  error,
  className,
}: ShopifyConnectionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetVendorShopifyConnectionInput>({
    resolver: zodResolver(setVendorShopifyConnectionSchema),
    defaultValues: {
      shopify_store_domain: "",
      shopify_client_id: "",
      shopify_client_secret: "",
      ...defaultValues,
    },
  })

  const submit = handleSubmit((values) => onSubmit(values))

  return (
    <form onSubmit={submit} className={cn("flex flex-col gap-4", className)}>
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
        {submitLabel}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
