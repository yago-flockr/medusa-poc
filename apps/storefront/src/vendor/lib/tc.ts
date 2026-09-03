/**
 * Unwraps a ts-rest client response, throwing when it didn't come back with
 * the expected status — replaces the `if (response.status !== 200) throw ...`
 * check repeated in every query/mutation hook.
 */
export async function tc<
  T extends { status: number; body: unknown },
  S extends number = 200,
>(promise: Promise<T>, status?: S): Promise<Extract<T, { status: S }>["body"]> {
  const expected = status ?? (200 as S)
  const response = await promise

  if (response.status !== expected) {
    throw new Error(`Unexpected response status ${response.status}`)
  }

  return response.body as Extract<T, { status: S }>["body"]
}
