"use client"

import {
  acceptTransferRequest,
  declineTransferRequest,
} from "@/store/lib/data/orders"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type TransferStatus = "pending" | "success" | "error"

const TransferActions = ({ id, token }: { id: string; token: string }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<{
    accept: TransferStatus | null
    decline: TransferStatus | null
  } | null>({
    accept: null,
    decline: null,
  })

  const acceptTransfer = async () => {
    setStatus({ accept: "pending", decline: null })
    setErrorMessage(null)

    const { success, error } = await acceptTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: success ? "success" : "error", decline: null })
  }

  const declineTransfer = async () => {
    setStatus({ accept: null, decline: "pending" })
    setErrorMessage(null)

    const { success, error } = await declineTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: null, decline: success ? "success" : "error" })
  }

  return (
    <div className="flex flex-col gap-y-4">
      {status?.accept === "success" && (
        <span className="text-success">
          Order transferred successfully!
        </span>
      )}
      {status?.decline === "success" && (
        <span className="text-success">
          Order transfer declined successfully!
        </span>
      )}
      {status?.accept !== "success" && status?.decline !== "success" && (
        <div className="flex gap-x-4">
          <Button
            size="lg"
            onClick={acceptTransfer}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            Accept transfer
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={declineTransfer}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            Decline transfer
          </Button>
        </div>
      )}
      {errorMessage && (
        <span className="text-destructive">{errorMessage}</span>
      )}
    </div>
  )
}

export default TransferActions
