import VendorModule from "../modules/vendor"
import OrderModule from "@medusajs/medusa/order"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  {
    linkable: OrderModule.linkable.order,
    isList: true,
  },
  VendorModule.linkable.vendor,
)
