import { Drawer } from "@medusajs/ui"
import type { Brand } from "../../../api/admin/brands/contract"
import { UpdateBrandForm, brandToForm } from "../../forms/brands/update-brand"
import { useUpdateOneBrand } from "../../hooks/mutations/brands"

type UpdateBrandDrawerProps = {
  brand: Brand | null
  onClose: () => void
}

export const UpdateBrandDrawer = ({ brand, onClose }: UpdateBrandDrawerProps) => {
  const updateOneBrand = useUpdateOneBrand()

  return (
    <Drawer open={Boolean(brand)} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Content>
        <UpdateBrandForm
          defaultValues={brand ? brandToForm(brand) : undefined}
          isLoading={updateOneBrand.isPending}
          onCancel={onClose}
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
              }
            )
          }}
        />
      </Drawer.Content>
    </Drawer>
  )
}
