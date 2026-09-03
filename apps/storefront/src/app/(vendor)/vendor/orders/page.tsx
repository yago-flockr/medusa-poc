"use client"

import { DataState } from "@/components/display/data-state"
import { ErrorAlert } from "@/components/display/error-alert"
import { FormDialog } from "@/components/display/form-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
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
          <ItemGroup>
            {getVendorsOrders.data?.orders.map((order: VendorOrder) => (
              <Item key={order.id} variant="outline">
                <ItemContent>
                  <ItemTitle>Order #{order.display_id}</ItemTitle>
                  <ItemDescription>{order.status}</ItemDescription>
                </ItemContent>
                <ItemActions>
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
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
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

                <ItemGroup>
                  {viewingOrder.items.map((item) => (
                    <Item key={item.id} variant="outline">
                      <ItemContent>
                        <ItemTitle>
                          {item.title} × {item.quantity}
                        </ItemTitle>
                        {(item.variant_title || item.variant_sku) && (
                          <ItemDescription>
                            {[item.variant_title, item.variant_sku]
                              .filter(Boolean)
                              .join(" — ")}
                          </ItemDescription>
                        )}
                      </ItemContent>
                      <ItemActions>
                        <Badge variant="muted">
                          {item.unit_price.toFixed(2)}{" "}
                          {viewingOrder.currency_code.toUpperCase()}
                        </Badge>
                      </ItemActions>
                    </Item>
                  ))}
                </ItemGroup>

                {viewingOrder.shipping_address && (
                  <Item variant="outline">
                    <ItemContent>
                      <ItemTitle>
                        {[
                          viewingOrder.shipping_address.first_name,
                          viewingOrder.shipping_address.last_name,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </ItemTitle>
                      <ItemDescription>
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
                      </ItemDescription>
                    </ItemContent>
                  </Item>
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
