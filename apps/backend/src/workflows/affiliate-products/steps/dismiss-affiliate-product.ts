import type { LinkDefinition } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { graph } from "../../../lib/query"
import { AFFILIATE_MODULE } from "../../../modules/affiliate"

export type DismissAffiliateProductStepInput = {
  affiliateId: string
  productId: string
}

export const dismissAffiliateProductStep = createStep(
  "dismiss-affiliate-product",
  async (
    { affiliateId, productId }: DismissAffiliateProductStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const link = container.resolve(ContainerRegistrationKeys.LINK)

    const {
      data: [affiliate],
    } = await graph(query, {
      entity: "affiliate",
      fields: ["id", "products.id"],
      filters: { id: affiliateId },
    })

    const isPromoted = (affiliate?.products ?? []).some(
      (product) => product?.id === productId,
    )

    if (!isPromoted) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "This product is not promoted by this affiliate.",
      )
    }

    const linkDef: LinkDefinition = {
      [AFFILIATE_MODULE]: { affiliate_id: affiliateId },
      [Modules.PRODUCT]: { product_id: productId },
    }

    await link.dismiss([linkDef])

    return new StepResponse({ id: productId }, linkDef)
  },
  async (linkDef: LinkDefinition | undefined, { container }) => {
    if (!linkDef) {
      return
    }

    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.create([linkDef])
  },
)
