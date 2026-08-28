"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RiAddLine } from "@remixicon/react"
import { useActionState, useEffect, useState } from "react"

import { addCustomerAddress } from "@/store/lib/data/customer"
import CountrySelect from "@/store/modules/checkout/components/country-select"
import { SubmitButton } from "@/store/modules/checkout/components/submit-button"
import Input from "@/store/modules/common/components/input"
import { HttpTypes } from "@medusajs/types"

const AddAddress = ({
  region,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
}) => {
  const [successState, setSuccessState] = useState(false)
  const [open, setOpen] = useState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        className="flex h-full min-h-[220px] w-full flex-col justify-between rounded-lg border p-5"
        onClick={() => setOpen(true)}
        data-testid="add-address-button"
      >
        <span className="font-semibold">New address</span>
        <RiAddLine />
      </button>

      <DialogContent data-testid="add-address-modal">
        <DialogHeader>
          <DialogTitle>Add address</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <div className="flex flex-col gap-y-2">
            <div className="grid grid-cols-2 gap-x-2">
              <Input
                label="First name"
                name="first_name"
                required
                autoComplete="given-name"
                data-testid="first-name-input"
              />
              <Input
                label="Last name"
                name="last_name"
                required
                autoComplete="family-name"
                data-testid="last-name-input"
              />
            </div>
            <Input
              label="Company"
              name="company"
              autoComplete="organization"
              data-testid="company-input"
            />
            <Input
              label="Address"
              name="address_1"
              required
              autoComplete="address-line1"
              data-testid="address-1-input"
            />
            <Input
              label="Apartment, suite, etc."
              name="address_2"
              autoComplete="address-line2"
              data-testid="address-2-input"
            />
            <div className="grid grid-cols-[144px_1fr] gap-x-2">
              <Input
                label="Postal code"
                name="postal_code"
                required
                autoComplete="postal-code"
                data-testid="postal-code-input"
              />
              <Input
                label="City"
                name="city"
                required
                autoComplete="locality"
                data-testid="city-input"
              />
            </div>
            <Input
              label="Province / State"
              name="province"
              autoComplete="address-level1"
              data-testid="state-input"
            />
            <CountrySelect
              region={region}
              name="country_code"
              required
              autoComplete="country"
              data-testid="country-select"
            />
            <Input
              label="Phone"
              name="phone"
              autoComplete="phone"
              data-testid="phone-input"
            />
          </div>
          {formState.error && (
            <div
              className="py-2 text-sm text-destructive"
              data-testid="address-error"
            >
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

export default AddAddress
