import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getVendorsRegionsResponseSchema } from "@dtc/api-contracts/vendor/regions"
import { resolveVendorUser } from "../resolve-vendor-user"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  await resolveVendorUser(query, req.auth_context.actor_id, ["id"])

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "countries.iso_2", "countries.display_name"],
  })

  const seen = new Set<string>()
  const countries = regions
    .flatMap((region) => region.countries ?? [])
    .filter(
      (country): country is NonNullable<typeof country> =>
        country != null && Boolean(country.iso_2),
    )
    .filter((country) => {
      if (seen.has(country.iso_2)) return false
      seen.add(country.iso_2)
      return true
    })
    .map((country) => ({
      iso_2: country.iso_2,
      display_name: country.display_name ?? country.iso_2.toUpperCase(),
    }))
    .sort((a, b) => a.display_name.localeCompare(b.display_name))

  res.json(getVendorsRegionsResponseSchema.parse({ countries }))
}
