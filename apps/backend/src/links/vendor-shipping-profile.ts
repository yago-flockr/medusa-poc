import VendorModule from "../modules/vendor"
import FulfillmentModule from "@medusajs/medusa/fulfillment"
import { defineLink } from "@medusajs/framework/utils"

// One vendor, one shipping profile — giving each vendor its own (instead of
// every vendor sharing the store's single default profile) is what lets a
// multi-vendor cart hold one shipping method per vendor without one evicting
// the other: Medusa's own addShippingMethodToCartWorkflow only replaces an
// existing method when the incoming one shares the same shipping_profile_id.
export default defineLink(VendorModule.linkable.vendor, FulfillmentModule.linkable.shippingProfile)
