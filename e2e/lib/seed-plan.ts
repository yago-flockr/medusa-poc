import { SEED_CONFIG } from "../../apps/backend/seeds/seed-config"
import { buildSeedPlan } from "../../apps/backend/seeds/seed-plan"

export const SEED_PLAN = buildSeedPlan(SEED_CONFIG)
