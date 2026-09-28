import { Metadata } from "next"

import AddressBook from "@/store/modules/account/components/address-book"

export const metadata: Metadata = {
  title: "Addresses",
  description: "View your addresses",
}

export default async function Addresses(props: {
  params: Promise<{ country: string }>
}) {
  const { country } = await props.params

  return (
    <div
      className="flex w-full flex-col gap-8"
      data-testid="addresses-page-wrapper"
    >
      <div className="flex flex-col gap-y-4">
        <h1 className="text-2xl font-semibold">Shipping Addresses</h1>
        <p className="text-sm">
          View and update your shipping addresses, you can add as many as you
          like. Saving your addresses will make them available during checkout.
        </p>
      </div>
      <AddressBook country={country} />
    </div>
  )
}
