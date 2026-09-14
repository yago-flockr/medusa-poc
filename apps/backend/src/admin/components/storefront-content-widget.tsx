import type {
  StorefrontContent,
  UpdateStorefrontContent,
} from "@dtc/api-contracts/common/storefront-content"
import { PencilSquare } from "@medusajs/icons"
import { Button, Drawer } from "@medusajs/ui"
import { StorefrontContentForm } from "../forms/storefront-content"
import { ActionMenu } from "./action-menu"
import { Card } from "./card"
import { TitleSubtitle } from "./title-subtitle"

const STOREFRONT_CONTENT_FORM_ID = "storefront-content-form"

export type StorefrontContentWidgetProps = {
  storefrontContent: StorefrontContent | null | undefined
  isSubmitting: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: UpdateStorefrontContent) => void
}

export const StorefrontContentWidget = ({
  storefrontContent,
  isSubmitting,
  open,
  onOpenChange,
  onSubmit,
}: StorefrontContentWidgetProps) => {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level="h2" title="Storefront Content" />
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: "Edit",
                  onClick: () => onOpenChange(true),
                },
              ],
            },
          ]}
        />
      </Card.Header>
      <Card.InfoRow>
        <Card.InfoLabel>Name</Card.InfoLabel>
        <Card.InfoText>{storefrontContent?.name}</Card.InfoText>
      </Card.InfoRow>
      <Card.InfoRow>
        <Card.InfoLabel>Description</Card.InfoLabel>
        <Card.InfoText>{storefrontContent?.description}</Card.InfoText>
      </Card.InfoRow>
      <Card.InfoRow>
        <Card.InfoLabel>Image URL</Card.InfoLabel>
        <Card.InfoText>{storefrontContent?.hero_image_url}</Card.InfoText>
      </Card.InfoRow>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <Drawer.Content>
          <Drawer.Header>
            <TitleSubtitle title="Edit Storefront Content" />
          </Drawer.Header>
          <Drawer.Body className="flex flex-1 flex-col gap-y-8 overflow-y-auto">
            <StorefrontContentForm
              id={STOREFRONT_CONTENT_FORM_ID}
              defaultValues={{
                name: storefrontContent?.name ?? "",
                description: storefrontContent?.description ?? "",
                hero_image_url: storefrontContent?.hero_image_url ?? "",
              }}
              isLoading={isSubmitting}
              onSubmit={onSubmit}
            />
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Button
                size="small"
                variant="secondary"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="small"
                type="submit"
                form={STOREFRONT_CONTENT_FORM_ID}
                isLoading={isSubmitting}
              >
                Save
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Card.Root>
  )
}
