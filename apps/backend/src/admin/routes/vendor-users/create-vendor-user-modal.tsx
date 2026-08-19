import { Button, FocusModal, toast } from "@medusajs/ui"
import { useState } from "react"
import { OtpShow } from "../../components/otp-show"
import { TitleSubtitle } from "../../components/title-subtitle"
import {
  CREATE_VENDOR_USER_FORM_ID,
  CreateVendorUserForm,
} from "../../forms/vendor-users/create-vendor-user"
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

  const handleClose = () => {
    setOpen(false)
    setOtp(undefined)
  }

  return (
    <FocusModal open={open} onOpenChange={setOpen}>
      <FocusModal.Trigger asChild>
        <Button size="small" variant="secondary">
          Create
        </Button>
      </FocusModal.Trigger>
      <FocusModal.Content>
        <FocusModal.Header />
        {otp ? (
          <>
            <FocusModal.Body className="flex flex-1 items-center justify-center">
              <OtpShow otp={otp} />
            </FocusModal.Body>
            <FocusModal.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Button
                  size="small"
                  variant="secondary"
                  type="button"
                  onClick={handleClose}
                >
                  Close
                </Button>
                <Button
                  size="small"
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(otp)
                    handleClose()
                  }}
                >
                  Copy
                </Button>
              </div>
            </FocusModal.Footer>
          </>
        ) : (
          <>
            <FocusModal.Body className="flex flex-1 flex-col items-center overflow-y-auto py-16">
              <div className="flex w-full max-w-[720px] flex-col gap-y-8">
                <TitleSubtitle
                  title="Create Vendor User"
                  description="A random password is generated automatically — it's shown once after creation, so copy it and share it with the vendor yourself. There is no invite email yet."
                />
                <CreateVendorUserForm
                  isLoading={createOneVendorUser.isPending}
                  vendorOptions={vendorOptions}
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
              </div>
            </FocusModal.Body>
            <FocusModal.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Button
                  size="small"
                  variant="secondary"
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={createOneVendorUser.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  type="submit"
                  form={CREATE_VENDOR_USER_FORM_ID}
                  isLoading={createOneVendorUser.isPending}
                >
                  Create
                </Button>
              </div>
            </FocusModal.Footer>
          </>
        )}
      </FocusModal.Content>
    </FocusModal>
  )
}
