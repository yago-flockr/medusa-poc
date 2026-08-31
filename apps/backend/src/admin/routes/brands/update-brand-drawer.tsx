import { Button, Drawer, toast } from "@medusajs/ui"
import type { Brand } from "@dtc/api-contracts/admin/brands"
import { TitleSubtitle } from "../../components/title-subtitle"
import {
  UPDATE_BRAND_FORM_ID,
  UpdateBrandForm,
  brandToForm,
} from "../../forms/brands/update-brand"
import { useUpdateOneBrand } from "../../hooks/mutations/brands"

type UpdateBrandDrawerProps = {
  brand: Brand | null
  onClose: () => void
}

export const UpdateBrandDrawer = ({
  brand,
  onClose,
}: UpdateBrandDrawerProps) => {
  const updateOneBrand = useUpdateOneBrand()

  return (
    <Drawer open={Boolean(brand)} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <TitleSubtitle title="Edit Brand" />
        </Drawer.Header>
        <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
          <UpdateBrandForm
            defaultValues={brand ? brandToForm(brand) : undefined}
            isLoading={updateOneBrand.isPending}
            onSubmit={(values) => {
              if (!brand) {
                return
              }

              updateOneBrand.mutate(
                { brandId: brand.id, body: values },
                {
                  onSuccess: () => {
                    onClose()
                  },
                  onError: (error) => {
                    toast.error("Failed to update brand", {
                      description: error.message,
                    })
                  },
                },
              )
            }}
          />
        </Drawer.Body>
        <Drawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <Button
              size="small"
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={updateOneBrand.isPending}
            >
              Cancel
            </Button>
            <Button
              size="small"
              type="submit"
              form={UPDATE_BRAND_FORM_ID}
              isLoading={updateOneBrand.isPending}
            >
              Save
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
