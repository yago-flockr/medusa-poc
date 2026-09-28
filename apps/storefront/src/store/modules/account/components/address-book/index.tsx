import { notFound } from "next/navigation"

import { retrieveCustomer } from "@/store/lib/data/customer"
import { getRegion } from "@/store/lib/data/regions"
import AddAddress from "../address-card/add-address"
import EditAddress from "../address-card/edit-address-modal"

type AddressBookProps = {
  country: string
}

export default async function AddressBook({ country }: AddressBookProps) {
  const customer = await retrieveCustomer()
  const region = await getRegion(country)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
      <AddAddress region={region} addresses={customer.addresses} />
      {customer.addresses.map((address) => (
        <EditAddress region={region} address={address} key={address.id} />
      ))}
    </div>
  )
}
