import { model } from "@medusajs/framework/utils"

export const StorefrontContent = model.define("storefront_content", {
  id: model.id().primaryKey(),
  name: model.text().nullable(),
  description: model.text().nullable(),
  hero_image_url: model.text().nullable(),
})
