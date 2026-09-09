import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"

const consignmentItemsSchema = z.object({
  order: z
    .object({
      items: z
        .array(
          z
            .object({
              id: z.string(),
              quantity: z.coerce.number(),
              consignment: z.object({ id: z.string() }).nullable(),
            })
            .nullable(),
        )
        .nullable(),
    })
    .nullable(),
})

export type ResolveConsignmentItemsStepInput = {
  consignmentId: string
}

export const resolveConsignmentItemsStep = createStep(
  "resolve-consignment-items",
  async (
    { consignmentId }: ResolveConsignmentItemsStepInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [rawConsignment],
    } = await query.graph({
      entity: "consignment",
      fields: ["order.items.*", "order.items.consignment.id"],
      filters: { id: consignmentId },
    })

    const parsed = consignmentItemsSchema.parse(rawConsignment)

    return new StepResponse(
      (parsed.order?.items ?? [])
        .filter(
          (item) => item != null && item.consignment?.id === consignmentId,
        )
        .map((item) => ({ id: item!.id, quantity: item!.quantity })),
    )
  },
)
