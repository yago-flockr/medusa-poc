import { createStep } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

export type AssertVariantsMatchOptionsStepInput = {
  options?: { title: string; values: string[] }[]
  variants: { optionValues: Record<string, string> }[]
}

function cartesianProduct(
  options: { title: string; values: string[] }[],
): Record<string, string>[] {
  return options.reduce<Record<string, string>[]>(
    (combinations, option) =>
      combinations.flatMap((combination) =>
        option.values.map((value) => ({
          ...combination,
          [option.title]: value,
        })),
      ),
    [{}],
  )
}

function comboKey(combo: Record<string, string>) {
  return Object.keys(combo)
    .sort()
    .map((key) => `${key}=${combo[key]}`)
    .join("|")
}

export const assertVariantsMatchOptionsStep = createStep(
  "assert-variants-match-options",
  async ({ options, variants }: AssertVariantsMatchOptionsStepInput) => {
    if (!options?.length) {
      if (variants.length !== 1) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Exactly one variant is required when no options are given.",
        )
      }
      return
    }

    const expectedKeys = new Set(cartesianProduct(options).map(comboKey))
    const suppliedKeys = variants.map((variant) =>
      comboKey(variant.optionValues),
    )

    const isExactMatch =
      expectedKeys.size === suppliedKeys.length &&
      suppliedKeys.every((key) => expectedKeys.has(key)) &&
      new Set(suppliedKeys).size === suppliedKeys.length

    if (!isExactMatch) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The submitted variants must cover every combination of the given options exactly once — no combination missing, none repeated, none extra.",
      )
    }
  },
)
