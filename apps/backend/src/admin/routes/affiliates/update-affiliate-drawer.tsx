import { Button, Drawer, Text, toast } from "@medusajs/ui"
import type { Affiliate } from "@dtc/api-contracts/admin/affiliates"
import { TitleSubtitle } from "../../components/title-subtitle"
import {
  UPDATE_AFFILIATE_FORM_ID,
  UpdateAffiliateForm,
} from "../../forms/affiliates/update-affiliate"
import { useUpdateOneAffiliate } from "../../hooks/mutations/affiliates"

type UpdateAffiliateDrawerProps = {
  affiliate: Affiliate | null
  onClose: () => void
}

export const UpdateAffiliateDrawer = ({
  affiliate,
  onClose,
}: UpdateAffiliateDrawerProps) => {
  const updateOneAffiliate = useUpdateOneAffiliate()

  return (
    <Drawer
      open={Boolean(affiliate)}
      onOpenChange={(open) => !open && onClose()}
    >
      <Drawer.Content>
        <Drawer.Header>
          <TitleSubtitle title="Update Affiliate" />
        </Drawer.Header>
        <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
          <div className="flex flex-col space-y-2">
            <Text size="small" weight="plus">
              Email
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              {affiliate?.email}
            </Text>
          </div>
          {affiliate && (
            <UpdateAffiliateForm
              key={affiliate.id}
              isLoading={updateOneAffiliate.isPending}
              defaultValues={{
                name: affiliate.name,
                handle: affiliate.handle,
                commission_rate: affiliate.commission_rate,
                storefront_content: {
                  name: affiliate.storefront_content?.name ?? "",
                  description: affiliate.storefront_content?.description ?? "",
                  hero_image_url:
                    affiliate.storefront_content?.hero_image_url ?? "",
                },
              }}
              onSubmit={(values) => {
                updateOneAffiliate.mutate(
                  { affiliateId: affiliate.id, body: values },
                  {
                    onSuccess: () => {
                      toast.success("Affiliate updated")
                      onClose()
                    },
                    onError: (error) => {
                      toast.error("Failed to update affiliate", {
                        description: error.message,
                      })
                    },
                  },
                )
              }}
            />
          )}
        </Drawer.Body>
        <Drawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <Button
              size="small"
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={updateOneAffiliate.isPending}
            >
              Cancel
            </Button>
            <Button
              size="small"
              type="submit"
              form={UPDATE_AFFILIATE_FORM_ID}
              isLoading={updateOneAffiliate.isPending}
            >
              Save
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
