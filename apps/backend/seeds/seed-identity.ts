import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createAdminUserWorkflow } from "../src/workflows/create-admin-user"
import { SEED_CONFIG } from "./seed-config"
import { buildSeedPlan } from "./seed-plan"

export default async function seedIdentity({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const staff =
    process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD
      ? [
          {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
          },
        ]
      : buildSeedPlan(SEED_CONFIG).staff

  for (const { email, password } of staff) {
    const { data: existing } = await query.graph({
      entity: "user",
      fields: ["id"],
      filters: { email },
    })

    if (existing[0]) {
      logger.info(`Staff user "${email}" already exists, skipping.`)
      continue
    }

    await createAdminUserWorkflow(container).run({ input: { email, password } })
    logger.info(`Staff login — email: ${email}  password: ${password}`)
  }
}
