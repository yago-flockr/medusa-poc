import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import seedAffiliates from "./seed-affiliates"
import seedCatalog from "./seed-catalog"
import seedCategories from "./seed-categories"
import seedIdentity from "./seed-identity"
import seedOrders from "./seed-orders"
import seedVendors from "./seed-vendors"

export default async function seed(args: ExecArgs) {
  const logger = args.container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info("Seeding catalog...")
  await seedCatalog(args)

  logger.info("Seeding categories...")
  await seedCategories(args)

  logger.info("Seeding identity...")
  await seedIdentity(args)

  logger.info("Seeding vendors...")
  await seedVendors(args)

  logger.info("Seeding affiliates...")
  await seedAffiliates(args)

  logger.info("Seeding orders...")
  await seedOrders(args)

  logger.info("Seeding complete.")
}
