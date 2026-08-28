"use client"

import { confirmEmailVerification } from "@/store/lib/data/customer"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type VerificationState = "verifying" | "success" | "error"

const VerifyAccount = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [state, setState] = useState<VerificationState>("verifying")
  // Guard against the effect running twice in React Strict Mode, which would
  // consume the single-use token before the customer sees the result.
  const confirmed = useRef(false)

  useEffect(() => {
    if (confirmed.current) {
      return
    }
    confirmed.current = true

    if (!token) {
      setState("error")
      return
    }

    confirmEmailVerification(token).then(({ success }) =>
      setState(success ? "success" : "error"),
    )
  }, [token])

  return (
    <div
      className="flex w-full max-w-sm flex-col items-center gap-y-4 text-center"
      data-testid="verify-account-page"
    >
      <h1 className="text-lg font-semibold uppercase">Email verification</h1>

      {state === "verifying" && (
        <p className="text-sm text-foreground">Verifying your email...</p>
      )}

      {state === "success" && (
        <>
          <p className="text-sm text-foreground">
            Your email is verified. You can now sign in to your account.
          </p>
          <LocalizedClientLink href="/account">
            <Button>Go to sign in</Button>
          </LocalizedClientLink>
        </>
      )}

      {state === "error" && (
        <>
          <p className="text-sm text-foreground">
            This verification link is invalid or has expired. Sign in to receive
            a new verification email.
          </p>
          <LocalizedClientLink href="/account">
            <Button variant="secondary">Go to sign in</Button>
          </LocalizedClientLink>
        </>
      )}
    </div>
  )
}

export default VerifyAccount
