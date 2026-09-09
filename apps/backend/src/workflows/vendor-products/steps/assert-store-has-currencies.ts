import { createStep } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

export type AssertStoreHasCurrenciesStepInput = {
  storeCurrencies: string[]
}

export const assertStoreHasCurrenciesStep = createStep(
  "assert-store-has-currencies",
  async ({ storeCurrencies }: AssertStoreHasCurrenciesStepInput) => {
    if (!storeCurrencies.length) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "The store has no supported currencies configured — cannot price a product.",
      )
    }
  },
)
