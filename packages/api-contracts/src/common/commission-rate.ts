import { z } from "zod"

export const commissionRateSchema = z
  .number()
  .min(0, "Commission rate cannot be negative")
  .max(1, "Commission rate is a fraction, so it cannot exceed 1")
