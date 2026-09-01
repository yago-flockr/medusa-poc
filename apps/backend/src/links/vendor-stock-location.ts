import { defineLink } from "@medusajs/framework/utils"
import StockLocationModule from "@medusajs/medusa/stock-location"
import VendorModule from "../modules/vendor"

export default defineLink(
  {
    linkable: StockLocationModule.linkable.stockLocation,
    isList: true,
  },
  VendorModule.linkable.vendor,
)
