import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Card } from "../components/card"
import { useAdminOrderRetrieve } from "../hooks/queries/orders"

const OrderAffiliateWidget = ({
  data: order,
}: DetailWidgetProps<AdminOrder>) => {
  const findOneOrder = useAdminOrderRetrieve(order.id, {
    fields:
      "id,+referral.commission_rate,+referral.commission_total,+referral.affiliate.name,+referral.affiliate.handle",
  })

  const referral = findOneOrder.data?.referral

  if (!referral) {
    return null
  }

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level="h2" title="Affiliate" />
      </Card.Header>
      <Card.InfoRow>
        <Card.InfoLabel>Name</Card.InfoLabel>
        <Card.InfoText>{referral.affiliate.name}</Card.InfoText>
      </Card.InfoRow>
      <Card.InfoRow>
        <Card.InfoLabel>Code</Card.InfoLabel>
        <Card.InfoText>{referral.affiliate.handle}</Card.InfoText>
      </Card.InfoRow>
      <Card.InfoRow>
        <Card.InfoLabel>Commission</Card.InfoLabel>
        <Card.InfoText>
          {`${referral.commission_total.toFixed(2)} ${order.currency_code.toUpperCase()} (${Math.round(referral.commission_rate * 100)}%)`}
        </Card.InfoText>
      </Card.InfoRow>
    </Card.Root>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default OrderAffiliateWidget
