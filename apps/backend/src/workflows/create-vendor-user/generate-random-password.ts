import crypto from "node:crypto"

export function generateRandomPassword() {
  return crypto.randomBytes(18).toString("base64url")
}
