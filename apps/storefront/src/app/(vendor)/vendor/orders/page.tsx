"use client"

import { DataState } from "@/components/display/data-state"
import { ErrorAlert } from "@/components/display/error-alert"
import { FormDialog } from "@/components/display/form-dialog"
import { ListItem } from "@/components/display/list-item"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VendorSection } from "@/vendor/components/section"
import {
  DispatchOrderForm,
  dispatchOrderFormToInput,
} from "@/vendor/forms/dispatch-order-form"
import {
  usePostVendorsOrdersByIdAccept,
  usePostVendorsOrdersByIdDispatch,
} from "@/vendor/hooks/mutations/orders"
import {
  useGetVendorsOrders,
  useGetVendorsOrdersById,
} from "@/vendor/hooks/queries/orders"
import type { VendorOrder } from "@dtc/api-contracts/vendor/orders"
import { RiPencilLine } from "@remixicon/react"
import { useState } from "react"
import { toast } from "sonner"

export default function VendorOrdersPage() {
  const getVendorsOrders = useGetVendorsOrders()
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null)

  const getVendorsOrdersById = useGetVendorsOrdersById(viewingOrderId ?? "", {
    enabled: viewingOrderId !== null,
  })
  const postVendorsOrdersByIdAccept = usePostVendorsOrdersByIdAccept()
  const postVendorsOrdersByIdDispatch = usePostVendorsOrdersByIdDispatch()

  const viewingOrder = getVendorsOrdersById.data

  return (
    <VendorSection
      title="Orders"
      description="Manage your orders"
      className="flex flex-col gap-3"
    >
      <DataState
        isLoading={getVendorsOrders.isLoading}
        isEmpty={getVendorsOrders.data?.orders.length === 0}
      >
        <DataState.Loading />
        <DataState.Empty>
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        </DataState.Empty>
        <DataState.Content>
          <ul className="flex flex-col gap-2">
            {getVendorsOrders.data?.orders.map((order: VendorOrder) => (
              <ListItem.Root key={order.id}>
                <ListItem.Group>
                  <ListItem.Title>Order #{order.display_id}</ListItem.Title>
                  <ListItem.Description>{order.status}</ListItem.Description>
                </ListItem.Group>
                <ListItem.Group className="flex-row items-center">
                  <Badge variant="muted">
                    {order.total.toFixed(2)} {order.currency_code.toUpperCase()}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setViewingOrderId(order.id)}
                  >
                    <RiPencilLine />
                  </Button>
                </ListItem.Group>
              </ListItem.Root>
            ))}
          </ul>
        </DataState.Content>
      </DataState>

      <FormDialog
        title={viewingOrder ? `Order #${viewingOrder.display_id}` : "Order"}
        open={viewingOrderId !== null}
        onOpenChange={(open) => {
          if (!open) setViewingOrderId(null)
        }}
      >
        {getVendorsOrdersById.error && (
          <ErrorAlert description={getVendorsOrdersById.error.message} />
        )}
        <DataState isLoading={getVendorsOrdersById.isLoading}>
          <DataState.Loading />
          <DataState.Content>
            {viewingOrder && (
              <div className="flex flex-col gap-4">
                <Badge variant="muted" className="w-fit">
                  {viewingOrder.consignment_status}
                </Badge>

                <ul className="flex flex-col gap-2">
                  {viewingOrder.items.map((item) => (
                    <ListItem.Root key={item.id}>
                      <ListItem.Group>
                        <ListItem.Title>
                          {item.title} × {item.quantity}
                        </ListItem.Title>
                        {(item.variant_title || item.variant_sku) && (
                          <ListItem.Description>
                            {[item.variant_title, item.variant_sku]
                              .filter(Boolean)
                              .join(" — ")}
                          </ListItem.Description>
                        )}
                      </ListItem.Group>
                      <ListItem.Group>
                        <Badge variant="muted">
                          {item.unit_price.toFixed(2)}{" "}
                          {viewingOrder.currency_code.toUpperCase()}
                        </Badge>
                      </ListItem.Group>
                    </ListItem.Root>
                  ))}
                </ul>

                {viewingOrder.shipping_address && (
                  <div className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {[
                        viewingOrder.shipping_address.first_name,
                        viewingOrder.shipping_address.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                    <p>
                      {[
                        viewingOrder.shipping_address.address_1,
                        viewingOrder.shipping_address.address_2,
                        viewingOrder.shipping_address.city,
                        viewingOrder.shipping_address.province,
                        viewingOrder.shipping_address.postal_code,
                        viewingOrder.shipping_address.country_code?.toUpperCase(),
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}

                {viewingOrder.consignment_status === "placed" && (
                  <Button
                    disabled={postVendorsOrdersByIdAccept.isPending}
                    onClick={() =>
                      postVendorsOrdersByIdAccept.mutate(viewingOrder.id, {
                        onSuccess: () => {
                          toast.success("Order accepted")
                          getVendorsOrdersById.refetch()
                          getVendorsOrders.refetch()
                        },
                      })
                    }
                  >
                    {postVendorsOrdersByIdAccept.isPending
                      ? "Accepting…"
                      : "Accept order"}
                  </Button>
                )}

                {viewingOrder.consignment_status === "accepted" && (
                  <DispatchOrderForm
                    isLoading={postVendorsOrdersByIdDispatch.isPending}
                    onSubmit={(values) =>
                      postVendorsOrdersByIdDispatch.mutate(
                        {
                          id: viewingOrder.id,
                          ...dispatchOrderFormToInput(values),
                        },
                        {
                          onSuccess: () => {
                            toast.success("Order dispatched")
                            getVendorsOrdersById.refetch()
                            getVendorsOrders.refetch()
                          },
                        },
                      )
                    }
                  />
                )}

                {viewingOrder.consignment_status === "dispatched" && (
                  <p className="text-sm text-muted-foreground">
                    This order has been dispatched.
                  </p>
                )}

                {postVendorsOrdersByIdAccept.error && (
                  <ErrorAlert
                    description={postVendorsOrdersByIdAccept.error.message}
                  />
                )}
                {postVendorsOrdersByIdDispatch.error && (
                  <ErrorAlert
                    description={postVendorsOrdersByIdDispatch.error.message}
                  />
                )}
              </div>
            )}
          </DataState.Content>
        </DataState>
      </FormDialog>
    </VendorSection>
  )
}
