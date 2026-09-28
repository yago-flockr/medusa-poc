"use client"

import {
  useGetAffiliatesOrders,
  useGetAffiliatesOrdersById,
} from "@/affiliate/hooks/queries/orders"
import { DataState } from "@/components/display/data-state"
import { FormDialog } from "@/components/display/form-dialog"
import { Section } from "@/components/display/section"
import { TextTooltip } from "@/components/display/text-tooltip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { RiEyeLine, RiFileList3Line } from "@remixicon/react"
import { useState } from "react"

export default function AffiliateOrdersPage() {
  const getAffiliatesOrders = useGetAffiliatesOrders()
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null)

  const getAffiliatesOrdersById = useGetAffiliatesOrdersById(
    viewingOrderId ?? "",
    { enabled: viewingOrderId !== null },
  )

  const viewingOrder = getAffiliatesOrdersById.data

  return (
    <Section
      title="Orders"
      description="Orders placed with your code"
      className="flex flex-col gap-3"
    >
      <DataState
        isLoading={getAffiliatesOrders.isLoading}
        isEmpty={getAffiliatesOrders.data?.orders.length === 0}
      >
        <DataState.Loading />
        <DataState.Empty>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <RiFileList3Line />
              </EmptyMedia>
              <EmptyTitle>No orders yet</EmptyTitle>
              <EmptyDescription>
                Orders placed with your code will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </DataState.Empty>
        <DataState.Content>
          <ItemGroup>
            {getAffiliatesOrders.data?.orders.map((order) => (
              <Item key={order.id} variant="outline">
                <ItemContent>
                  <ItemTitle>Order #{order.display_id}</ItemTitle>
                  <ItemDescription>{order.units} units</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Badge variant="muted">
                    {order.commission_total.toFixed(2)}{" "}
                    {order.currency_code.toUpperCase()}
                  </Badge>
                  <TextTooltip content="View order">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="View order"
                      onClick={() => setViewingOrderId(order.id)}
                    >
                      <RiEyeLine />
                    </Button>
                  </TextTooltip>
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
        <DataState isLoading={getAffiliatesOrdersById.isLoading}>
          <DataState.Loading />
          <DataState.Content>
            {viewingOrder && (
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
            )}
          </DataState.Content>
        </DataState>
      </FormDialog>
    </Section>
  )
}
