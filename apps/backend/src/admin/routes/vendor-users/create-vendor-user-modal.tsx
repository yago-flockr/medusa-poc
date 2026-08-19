import { Button, FocusModal, toast } from "@medusajs/ui"
import { useState } from "react"
import { OtpShow } from "../../components/otp-show"
import { CreateVendorUserForm } from "../../forms/vendor-users/create-vendor-user"
import { useCreateOneVendorUser } from "../../hooks/mutations/vendor-users"
import { useFindManyVendors } from "../../hooks/queries/vendors"

export const CreateVendorUserModal = () => {
  const [open, setOpen] = useState(false)
  const [otp, setOtp] = useState<string>()

  const createOneVendorUser = useCreateOneVendorUser()
  const findManyVendors = useFindManyVendors({ limit: 1000 })

  const vendorOptions = (findManyVendors.data?.vendors ?? []).map((vendor) => ({
    value: vendor.id,
    label: vendor.name,
  }))

  return (
    <FocusModal open={open} onOpenChange={setOpen}>
      <FocusModal.Trigger asChild>
        <Button size="small" variant="secondary">
          Create
        </Button>
      </FocusModal.Trigger>
      <FocusModal.Content>
        {otp ? (
          <>
            <FocusModal.Header />
            <FocusModal.Body>
              <OtpShow className="h-full" otp={otp} />
            </FocusModal.Body>
            <FocusModal.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Button
                  size="small"
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    setOtp(undefined)
                  }}
                >
                  Close
                </Button>
                <Button
                  size="small"
                  type="submit"
                  onClick={() => {
                    navigator.clipboard.writeText(otp)
                    setOpen(false)
                    setOtp(undefined)
                  }}
                >
                  Copy
                </Button>
              </div>
            </FocusModal.Footer>
          </>
        ) : (
          <CreateVendorUserForm
            isLoading={createOneVendorUser.isPending}
            vendorOptions={vendorOptions}
            onCancel={() => setOpen(false)}
            onSubmit={(values) => {
              createOneVendorUser.mutate(values, {
                onSuccess: (data) => {
                  setOtp(data.password)
                },
                onError: (error) => {
                  toast.error("Failed to create vendor user", {
                    description: error.message,
                  })
                },
              })
            }}
          />
        )}
      </FocusModal.Content>
    </FocusModal>
  )
}
