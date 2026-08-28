import { useMemo } from "react"

import compareAddresses from "@/store/lib/util/compare-addresses"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HttpTypes } from "@medusajs/types"

type AddressSelectProps = {
  addresses: HttpTypes.StoreCustomerAddress[]
  addressInput: HttpTypes.StoreCartAddress | null
  onSelect: (
    address: HttpTypes.StoreCartAddress | undefined,
    email?: string,
  ) => void
}

const AddressSelect = ({
  addresses,
  addressInput,
  onSelect,
}: AddressSelectProps) => {
  const handleSelect = (id: string) => {
    const savedAddress = addresses.find((a) => a.id === id)
    if (savedAddress) {
      onSelect(savedAddress as HttpTypes.StoreCartAddress)
    }
  }

  const selectedAddress = useMemo(() => {
    return addresses.find(
      (a) => addressInput && compareAddresses(a, addressInput),
    )
  }, [addresses, addressInput])

  return (
    <Select
      value={selectedAddress?.id}
      onValueChange={(value) => handleSelect(value as string)}
    >
      <SelectTrigger
        className="w-full"
        data-testid="shipping-address-select"
      >
        <SelectValue placeholder="Choose an address" />
      </SelectTrigger>
      <SelectContent data-testid="shipping-address-options">
        {addresses.map((address) => (
          <SelectItem
            key={address.id}
            value={address.id}
            data-testid="shipping-address-option"
          >
            <div className="flex flex-col text-left">
              <span className="font-medium">
                {address.first_name} {address.last_name}
              </span>
              {address.company && (
                <span className="text-sm text-muted-foreground">
                  {address.company}
                </span>
              )}
              <div className="mt-1 flex flex-col text-sm text-muted-foreground">
                <span>
                  {address.address_1}
                  {address.address_2 && <span>, {address.address_2}</span>}
                </span>
                <span>
                  {address.postal_code}, {address.city}
                </span>
                <span>
                  {address.province && `${address.province}, `}
                  {address.country_code?.toUpperCase()}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default AddressSelect
