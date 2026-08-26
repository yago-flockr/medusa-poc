"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useSetVendorShopifyConnection } from "@/vendor/hooks/mutations/shopify"
import {
  setVendorShopifyConnectionSchema,
  type SetVendorShopifyConnectionInput,
} from "@dtc/api-contracts/vendor/shopify-connection"
import { useForm } from "react-hook-form"
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TextField } from "./fields/text-field"

type ShopifyConnectionFormProps = Omit<
  ComponentProps<"form">,
  "onSubmit" | "children"
> & {
  defaultValues?: Partial<SetVendorShopifyConnectionInput>
  onSaved?: () => void
}

export function ShopifyConnectionForm({
  defaultValues,
  onSaved,
  className,
  ...props
}: ShopifyConnectionFormProps) {
  const setVendorShopifyConnection = useSetVendorShopifyConnection()
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

  const submit = handleSubmit((values) => {
    setVendorShopifyConnection.mutate(values, { onSuccess: onSaved })
  })

  return (
    <form
      onSubmit={submit}
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
