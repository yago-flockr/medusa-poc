import VendorModule from "../modules/vendor"
import OrderModule from "@medusajs/medusa/order"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  {
    linkable: VendorModule.linkable.consignment,
    isList: true,
  },
  OrderModule.linkable.order,
)
