"use client"

import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@/store/lib/data/customer"
import CountrySelect from "@/store/modules/checkout/components/country-select"
import { SubmitButton } from "@/store/modules/checkout/components/submit-button"
import Input from "@/store/modules/common/components/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { RiDeleteBinLine, RiPencilLine } from "@remixicon/react"
import { HttpTypes } from "@medusajs/types"
import React, { useActionState, useEffect, useState } from "react"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const [open, setOpen] = useState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const close = () => {
    setSuccessState(false)
    setOpen(false)
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "flex h-full min-h-[220px] w-full flex-col justify-between rounded-lg border p-5 transition-colors",
          {
            "border-foreground": isActive,
          },
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col">
          <h3 className="text-left font-semibold" data-testid="address-name">
            {address.first_name} {address.last_name}
          </h3>
          {address.company && (
            <span
              className="text-sm text-foreground"
              data-testid="address-company"
            >
              {address.company}
            </span>
          )}
          <span className="mt-2 flex flex-col text-left text-sm">
            <span data-testid="address-address">
              {address.address_1}
              {address.address_2 && <span>, {address.address_2}</span>}
            </span>
            <span data-testid="address-postal-city">
              {address.postal_code}, {address.city}
            </span>
            <span data-testid="address-province-country">
              {address.province && `${address.province}, `}
              {address.country_code?.toUpperCase()}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-x-4">
          <button
            className="flex items-center gap-x-2 text-sm"
            onClick={() => setOpen(true)}
            data-testid="address-edit-button"
          >
            <RiPencilLine size={16} />
            Edit
          </button>
          <button
            className="flex items-center gap-x-2 text-sm"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner /> : <RiDeleteBinLine size={16} />}
            Remove
          </button>
        </div>
      </div>

      <DialogContent data-testid="edit-address-modal">
        <DialogHeader>
          <DialogTitle>Edit address</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <div className="grid grid-cols-1 gap-y-2">
            <div className="grid grid-cols-2 gap-x-2">
              <Input
                label="First name"
                name="first_name"
                required
                autoComplete="given-name"
                defaultValue={address.first_name || undefined}
                data-testid="first-name-input"
              />
              <Input
                label="Last name"
                name="last_name"
                required
                autoComplete="family-name"
                defaultValue={address.last_name || undefined}
                data-testid="last-name-input"
              />
            </div>
            <Input
              label="Company"
              name="company"
              autoComplete="organization"
              defaultValue={address.company || undefined}
              data-testid="company-input"
            />
            <Input
              label="Address"
              name="address_1"
              required
              autoComplete="address-line1"
              defaultValue={address.address_1 || undefined}
              data-testid="address-1-input"
            />
            <Input
              label="Apartment, suite, etc."
              name="address_2"
              autoComplete="address-line2"
              defaultValue={address.address_2 || undefined}
              data-testid="address-2-input"
            />
            <div className="grid grid-cols-[144px_1fr] gap-x-2">
              <Input
                label="Postal code"
                name="postal_code"
                required
                autoComplete="postal-code"
                defaultValue={address.postal_code || undefined}
                data-testid="postal-code-input"
              />
              <Input
                label="City"
                name="city"
                required
                autoComplete="locality"
                defaultValue={address.city || undefined}
                data-testid="city-input"
              />
            </div>
            <Input
              label="Province / State"
              name="province"
              autoComplete="address-level1"
              defaultValue={address.province || undefined}
              data-testid="state-input"
            />
            <CountrySelect
              name="country_code"
              region={region}
              required
              autoComplete="country"
              defaultValue={address.country_code || undefined}
              data-testid="country-select"
            />
            <Input
              label="Phone"
              name="phone"
              autoComplete="phone"
              defaultValue={address.phone || undefined}
              data-testid="phone-input"
            />
          </div>
          {formState.error && (
            <div className="py-2 text-sm text-destructive">
              {formState.error}
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <Button
              type="reset"
              variant="secondary"
              onClick={close}
              className="h-10"
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <SubmitButton data-testid="save-button">Save</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditAddress
