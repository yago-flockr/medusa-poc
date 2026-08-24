import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"

export type ResolveSharedProductOptionsStepInput = {
  options: { title: string; values: string[] }[]
  shared: boolean
}

type ResolvedOption =
  | { id: string }
  | { title: string; values: string[]; is_exclusive?: boolean }

type OptionCompensation = {
  id: string
  previousValues: string[]
}

function resolveExclusiveOptions(
  options: { title: string; values: string[] }[],
): ResolvedOption[] {
  return options.map((option) => ({ title: option.title, values: option.values }))
}

// Medusa's shared (is_exclusive: false) product options are looked up by
// title with a DB-level unique constraint, so every vendor's product with
// the same option title must resolve to the same underlying row.
async function resolveSharedOptionsWithLocking(
  options: { title: string; values: string[] }[],
  container: MedusaContainer,
): Promise<{ resolved: ResolvedOption[]; compensation: OptionCompensation[] }> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const lockingModuleService = container.resolve(Modules.LOCKING)

  const { data: existingOptions } = await query.graph({
    entity: "product_option",
    fields: ["id", "title"],
    filters: { title: options.map((option) => option.title), is_exclusive: false },
  })

  const existingByTitle = new Map(
    existingOptions.map((option) => [option.title, option]),
  )

  const updates = (
    await Promise.all(
      options.flatMap((option) => {
        const existing = existingByTitle.get(option.title)
        if (!existing) {
          return []
        }

        return [
          // Locked per option id, with a fresh read inside the lock — two
          // concurrent writers adding different values would otherwise both
          // read the same stale list and one's addition would silently
          // overwrite the other's.
          lockingModuleService.execute(`product-option:${existing.id}`, async () => {
            const {
              data: [fresh],
            } = await query.graph({
              entity: "product_option",
              fields: ["values.value"],
              filters: { id: existing.id },
            })

            const existingValues = (fresh.values ?? [])
              .filter((value) => value != null)
              .map((value) => value!.value)
            const missingValues = option.values.filter(
              (value) => !existingValues.includes(value),
            )

            if (!missingValues.length) {
              return null
            }

            await productModuleService.updateProductOptions(existing.id, {
              values: [...existingValues, ...missingValues],
            })

            return { id: existing.id, previousValues: existingValues }
          }),
        ]
      }),
    )
  ).filter((update): update is OptionCompensation => update !== null)

  const resolved: ResolvedOption[] = options.map((option) => {
    const existing = existingByTitle.get(option.title)
    return existing
      ? { id: existing.id }
      : { title: option.title, values: option.values, is_exclusive: false }
  })

  return { resolved, compensation: updates }
}

export const resolveSharedProductOptionsStep = createStep(
  "resolve-shared-product-options",
  async (input: ResolveSharedProductOptionsStepInput, { container }) => {
    if (!input.shared) {
      return new StepResponse(resolveExclusiveOptions(input.options), [])
    }

    const { resolved, compensation } = await resolveSharedOptionsWithLocking(
      input.options,
      container,
    )
    return new StepResponse(resolved, compensation)
  },
  async (compensation: OptionCompensation[] | undefined, { container }) => {
    if (!compensation?.length) {
      return
    }

    const productModuleService = container.resolve(Modules.PRODUCT)

    await Promise.all(
      compensation.map((entry) =>
        productModuleService.updateProductOptions(entry.id, {
          values: entry.previousValues,
        }),
      ),
    )
  },
)
