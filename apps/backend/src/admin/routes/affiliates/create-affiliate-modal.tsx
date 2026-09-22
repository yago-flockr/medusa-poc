import { Button, FocusModal, toast } from "@medusajs/ui"
import { useState } from "react"
import { OtpShow } from "../../components/otp-show"
import { TitleSubtitle } from "../../components/title-subtitle"
import {
  CREATE_AFFILIATE_FORM_ID,
  CreateAffiliateForm,
} from "../../forms/affiliates/create-affiliate"
import { useCreateOneAffiliate } from "../../hooks/mutations/affiliates"

export const CreateAffiliateModal = () => {
  const [open, setOpen] = useState(false)
  const [otp, setOtp] = useState<string>()

  const createOneAffiliate = useCreateOneAffiliate()

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
                  title="Create Affiliate"
                  description="A random password is generated automatically — it's shown once after creation, so copy it and share it with the affiliate yourself. Leave the handle empty to derive it from the name; it doubles as their referral code."
                />
                <CreateAffiliateForm
                  isLoading={createOneAffiliate.isPending}
                  onSubmit={(values) => {
                    createOneAffiliate.mutate(values, {
                      onSuccess: (data) => {
                        setOtp(data.password)
                      },
                      onError: (error) => {
                        toast.error("Failed to create affiliate", {
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
                  disabled={createOneAffiliate.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  type="submit"
                  form={CREATE_AFFILIATE_FORM_ID}
                  isLoading={createOneAffiliate.isPending}
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
