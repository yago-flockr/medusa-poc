import { MedusaService } from "@medusajs/framework/utils"
import { Affiliate } from "./models/affiliate"
import { Referral } from "./models/referral"

class AffiliateModuleService extends MedusaService({
  Affiliate,
  Referral,
}) {}

export default AffiliateModuleService
