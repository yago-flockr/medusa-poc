import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createAdminUserWorkflow } from "../workflows/create-admin-user"
import { createVendorWorkflow } from "../workflows/create-vendor"
import { createVendorUserWorkflow } from "../workflows/create-vendor-user"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "supersecret"

const DEMO_VENDOR_NAME = "Demo Vendor"
const DEMO_VENDOR_HANDLE = "demo-vendor"
const DEMO_VENDOR_EMAIL = "vendor@example.com"

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
  } else {
    await createAdminUserWorkflow(container).run({
      input: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    })
    logger.info(
      `Admin login — email: ${ADMIN_EMAIL}  password: ${ADMIN_PASSWORD}`,
    )
  }

  logger.info("Seeding a demo vendor...")

  const { data: existingVendors } = await query.graph({
    entity: "vendor",
    fields: ["id"],
    filters: { handle: DEMO_VENDOR_HANDLE },
  })

  let vendorId = existingVendors[0]?.id

  if (vendorId) {
    logger.info(`Vendor "${DEMO_VENDOR_NAME}" already exists, skipping.`)
  } else {
    const { result: vendor } = await createVendorWorkflow(container).run({
      input: { name: DEMO_VENDOR_NAME, handle: DEMO_VENDOR_HANDLE },
    })
    vendorId = vendor.id
  }

  const { data: existingVendorUsers } = await query.graph({
    entity: "vendor_user",
    fields: ["id"],
    filters: { email: DEMO_VENDOR_EMAIL },
  })

  if (existingVendorUsers[0]) {
    logger.info(
      `Vendor user "${DEMO_VENDOR_EMAIL}" already exists, skipping — its password was only shown once, at creation.`,
    )
    return
  }

  const { result: vendorUser } = await createVendorUserWorkflow(container).run({
    input: {
      vendor_id: vendorId,
      email: DEMO_VENDOR_EMAIL,
      first_name: "Demo",
    },
  })

  logger.info(
    `Demo vendor login — email: ${vendorUser.email}  password: ${vendorUser.password}`,
  )
}
