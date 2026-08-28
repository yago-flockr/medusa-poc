import { isStripeLike, paymentInfoMap } from "@/store/lib/constants"
import { convertToLocale } from "@/store/lib/util/money"
import Divider from "@/store/modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0].payments?.[0]

  return (
    <div>
      <h2 className="my-6 flex flex-row text-2xl font-medium">Payment</h2>
      <div>
        {payment && (
          <div className="flex w-full items-start gap-x-1">
            <div className="flex w-1/3 flex-col">
              <span className="mb-1 font-medium">Payment method</span>
              <span
                className="text-sm text-muted-foreground"
                data-testid="payment-method"
              >
                {paymentInfoMap[payment.provider_id].title}
              </span>
            </div>
            <div className="flex w-2/3 flex-col">
              <span className="mb-1 font-medium">Payment details</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-7 w-fit items-center rounded-md bg-muted p-2">
                  {paymentInfoMap[payment.provider_id].icon}
                </div>
                <span data-testid="payment-amount">
                  {isStripeLike(payment.provider_id) && payment.data?.card_last4
                    ? `**** **** **** ${payment.data.card_last4}`
                    : `${convertToLocale({
                        amount: payment.amount,
                        currency_code: order.currency_code,
                      })} paid at ${new Date(
                        payment.created_at ?? "",
                      ).toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
