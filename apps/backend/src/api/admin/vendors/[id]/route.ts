import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  MedusaError,
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"
import { updateVendorWorkflow } from "../../../../workflows/update-vendor"
import type { UpdateVendor } from "../contract"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const {
    data: [vendor],
  } = await query.graph({
    entity: "vendor",
    filters: { id },
    ...req.queryConfig,
  })

  if (!vendor) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Vendor with id: ${id} was not found`,
    )
  }

  res.json({ vendor })
}

export const POST = async (
  req: MedusaRequest<UpdateVendor>,
  res: MedusaResponse,
) => {
  const { id } = req.params

  const { result } = await updateVendorWorkflow(req.scope).run({
    input: {
      id,
      ...req.validatedBody,
    },
  })

  res.json({ vendor: result })
}
