"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PostVendorsOrdersByIdDispatchInput } from "@dtc/api-contracts/vendor/orders"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { TextField } from "./fields/text-field"
import type { CommonFormProps } from "./form-type"

export const dispatchOrderSchema = z.object({
  tracking_number: z.string().min(1, "Tracking number is required"),
  tracking_url: z.string().optional(),
})

export type DispatchOrderSchema = z.infer<typeof dispatchOrderSchema>

type DispatchOrderFormProps = CommonFormProps<DispatchOrderSchema>

export function dispatchOrderFormToInput(
  values: DispatchOrderSchema,
): PostVendorsOrdersByIdDispatchInput {
  return {
    tracking_number: values.tracking_number,
    tracking_url: values.tracking_url || undefined,
  }
}

export function DispatchOrderForm({
  isLoading,
  onSubmit,
  className,
  ...props
}: DispatchOrderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DispatchOrderSchema>({
    resolver: zodResolver(dispatchOrderSchema),
    defaultValues: { tracking_number: "", tracking_url: "" },
  })

  return (
    <form
      onSubmit={handleSubmit(
        (values) => onSubmit?.(values),
        (formErrors) => console.error("Form validation failed:", formErrors),
      )}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <TextField
        id="order-tracking-number"
        label="Tracking number"
        error={errors.tracking_number?.message}
        {...register("tracking_number")}
      />
      <TextField
        id="order-tracking-url"
        label="Tracking URL"
        error={errors.tracking_url?.message}
        {...register("tracking_url")}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Dispatching…" : "Mark as Dispatched"}
      </Button>
    </form>
  )
}
