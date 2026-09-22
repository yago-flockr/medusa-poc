import type {
  AuthenticationInput,
  MedusaContainer,
} from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { generateRandomPassword } from "../../../lib/generate-random-password"

export async function registerActorAuthIdentity({
  container,
  email,
  password,
}: {
  container: MedusaContainer
  email: string
  password?: string
}) {
  const authModuleService = container.resolve(Modules.AUTH)
  const generatedPassword = password ?? generateRandomPassword()

  const { success, authIdentity, error } = await authModuleService.register(
    "emailpass",
    {
      url: "",
      headers: {},
      query: {},
      protocol: "https",
      body: { email, password: generatedPassword },
    } as AuthenticationInput,
  )

  if (!success || !authIdentity) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      error ?? `Could not create a login for ${email}.`,
    )
  }

  return { authIdentity, password: generatedPassword }
}

// emailpass keys identity by email (entity_id), not by the actor's own id.
export async function regenerateActorPassword({
  container,
  email,
}: {
  container: MedusaContainer
  email: string
}) {
  const authModuleService = container.resolve(Modules.AUTH)
  const password = generateRandomPassword()

  const { success, error } = await authModuleService.updateProvider(
    "emailpass",
    { password, entity_id: email },
  )

  if (!success) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      error ?? `Could not regenerate the password for ${email}.`,
    )
  }

  return { password }
}

export async function deleteActorAuthIdentity({
  container,
  authIdentityId,
}: {
  container: MedusaContainer
  authIdentityId: string
}) {
  const authModuleService = container.resolve(Modules.AUTH)
  await authModuleService.deleteAuthIdentities([authIdentityId])
}
