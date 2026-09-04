import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import seedCatalog from "./seed-catalog"
import seedIdentity from "./seed-identity"
import seedVendors from "./seed-vendors"

export default async function seed(args: ExecArgs) {
  const logger = args.container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info("Seeding catalog...")
  await seedCatalog(args)

  logger.info("Seeding identity...")
  await seedIdentity(args)

  logger.info("Seeding vendors...")
  await seedVendors(args)

  logger.info("Seeding complete.")
}
