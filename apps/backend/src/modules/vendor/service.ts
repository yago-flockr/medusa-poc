import { MedusaService } from "@medusajs/framework/utils"
import { Vendor } from "./models/vendor"
import { VendorUser } from "./models/vendor-user"
import { VendorIntegrationConnection } from "./models/vendor-integration-connection"
import { Consignment } from "./models/consignment"

class VendorModuleService extends MedusaService({
  Vendor,
  VendorUser,
  VendorIntegrationConnection,
  Consignment,
}) {}

export default VendorModuleService
