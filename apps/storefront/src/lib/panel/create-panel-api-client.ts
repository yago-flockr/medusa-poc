const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

export class PanelApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type ApiErrorBody = { message?: string }

type PanelRequestOptions = {
  method?: string
  authToken?: string
  body?: unknown
}

export function createPanelApiClient({
  getToken,
  onUnauthorized,
}: {
  getToken: () => string | null | undefined
  onUnauthorized: () => void
}) {
  function assertOkResponse(res: Response, data: unknown, path: string): void {
    if (res.ok) {
      return
    }

    if (res.status === 401) {
      onUnauthorized()
    }

    const message = (data as ApiErrorBody)?.message
    throw new PanelApiError(
      message ?? `Request to ${path} failed (${res.status})`,
      res.status,
    )
  }

  async function request<T>(
    path: string,
    options: PanelRequestOptions = {},
  ): Promise<T> {
    const token = options.authToken ?? getToken()

    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const data: unknown = await res.json().catch(() => ({}))
    assertOkResponse(res, data, path)

    return data as T
  }

  async function requestFormData<T>(path: string, body: FormData): Promise<T> {
    const token = getToken()

    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body,
    })

    const data: unknown = await res.json().catch(() => ({}))
    assertOkResponse(res, data, path)

    return data as T
  }

  return { assertOkResponse, request, requestFormData }
}
