import { brandAdditionalData } from "../brands/additional-data"
import { vendorAdditionalData } from "../../vendors/additional-data"

export const productAdditionalDataValidators = {
  ...brandAdditionalData,
  ...vendorAdditionalData,
}
