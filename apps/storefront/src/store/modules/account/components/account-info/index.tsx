import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    <div className="text-sm" data-testid={dataTestid}>
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
            className="w-[100px]"
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
        <Badge variant="success" className="my-4" data-testid="success-message">
          {label} updated succesfully
        </Badge>
      )}

      {isError && (
        <Badge
          variant="destructive"
          className="my-4"
          data-testid="error-message"
        >
          {errorMessage}
        </Badge>
      )}

      {state && (
        <div className="flex flex-col gap-y-2 py-4">
          <div>{children}</div>
          <div className="mt-2 flex items-center justify-end">
            <Button
              disabled={pending}
              className="w-full sm:max-w-[140px]"
              type="submit"
              data-testid="save-button"
            >
              Save changes
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountInfo
