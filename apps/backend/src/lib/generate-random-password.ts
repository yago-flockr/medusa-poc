import crypto from "node:crypto"

// Server-generated, never staff- or vendor-typed — a security requirement.
export function generateRandomPassword() {
  return crypto.randomBytes(18).toString("base64url")
}
