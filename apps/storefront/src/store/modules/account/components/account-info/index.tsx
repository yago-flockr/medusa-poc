"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RiCheckboxCircleLine, RiErrorWarningLine } from "@remixicon/react"
import { useEffect } from "react"

import useToggleState from "@/store/lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  "data-testid"?: string
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "An error occurred, please try again",
  children,
  "data-testid": dataTestid,
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()

  const { pending } = useFormStatus()

  const handleToggle = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div className="flex flex-col gap-4 text-sm" data-testid={dataTestid}>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="uppercase text-foreground">{label}</span>
          <div className="flex flex-1 basis-0 items-center justify-end gap-x-4">
            {typeof currentInfo === "string" ? (
              <span className="font-semibold" data-testid="current-info">
                {currentInfo}
              </span>
            ) : (
              currentInfo
            )}
          </div>
        </div>
        <div>
          <Button
            variant="secondary"
            onClick={handleToggle}
            type={state ? "reset" : "button"}
            data-testid="edit-button"
            data-active={state}
          >
            {state ? "Cancel" : "Edit"}
          </Button>
        </div>
      </div>

      {isSuccess && (
        <Alert variant="success" data-testid="success-message">
          <RiCheckboxCircleLine />
          <AlertDescription>{label} updated successfully</AlertDescription>
        </Alert>
      )}

      {isError && (
        <Alert variant="destructive" data-testid="error-message">
          <RiErrorWarningLine />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {state && (
        <div className="flex flex-col gap-y-2">
          <div>{children}</div>
          <div className="flex items-center justify-end">
            <Button disabled={pending} type="submit" data-testid="save-button">
              Save changes
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountInfo
