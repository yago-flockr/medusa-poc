import { Separator } from "@/components/ui/separator"
import TransferActions from "@/store/modules/order/components/transfer-actions"
import TransferImage from "@/store/modules/order/components/transfer-image"

export default async function TransferPage({
  params,
}: {
  params: { id: string; token: string }
}) {
  const { id, token } = params

  return (
    <div className="mx-auto mt-10 mb-20 flex w-2/5 flex-col items-start gap-y-4">
      <TransferImage />
      <div className="flex flex-col gap-y-6">
        <h1 className="text-xl font-semibold">
          Transfer request for order {id}
        </h1>
        <p className="text-muted-foreground">
          You&#39;ve received a request to transfer ownership of your order (
          {id}). If you agree to this request, you can approve the transfer by
          clicking the button below.
        </p>
        <Separator />
        <p className="text-muted-foreground">
          If you accept, the new owner will take over all responsibilities and
          permissions associated with this order.
        </p>
        <p className="text-muted-foreground">
          If you do not recognize this request or wish to retain ownership, no
          further action is required.
        </p>
        <Separator />
        <TransferActions id={id} token={token} />
      </div>
    </div>
  )
}
