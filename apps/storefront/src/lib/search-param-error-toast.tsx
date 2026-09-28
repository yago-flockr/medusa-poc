"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export function SearchParamErrorToast() {
  useEffect(() => {
    const url = new URL(window.location.href)
    const error = url.searchParams.get("error")

    if (!error) {
      return
    }

    toast.error(error)
    url.searchParams.delete("error")
    window.history.replaceState(window.history.state, "", url)
  }, [])

  return null
}
