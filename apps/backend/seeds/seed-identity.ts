import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createAdminUserWorkflow } from "../src/workflows/create-admin-user"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "qwe@flockr.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "qwe"

export default async function seedIdentity({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Seeding the admin user...")

  const { data: existingAdmins } = await query.graph({
    entity: "user",
    fields: ["id"],
    filters: { email: ADMIN_EMAIL },
  })

  if (existingAdmins[0]) {
    logger.info(`Admin user "${ADMIN_EMAIL}" already exists, skipping.`)
    return
  }

  await createAdminUserWorkflow(container).run({
    input: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })
  logger.info(
    `Admin login — email: ${ADMIN_EMAIL}  password: ${ADMIN_PASSWORD}`,
  )
}
