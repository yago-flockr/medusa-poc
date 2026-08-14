import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query"

// For custom modules only (no Medusa SDK support, so every operation is a
// hand-written sdk.client.fetch call). A core resource with a typed SDK
// method (sdk.admin.<resource>.*) should wrap it directly with useMutation
// instead — there's no repeated mutationKey/invalidate wiring left to remove.
type ResourceMutationConfig<TVariables, TData> = {
  mutationKey: readonly unknown[]
  mutationFn: (variables: TVariables) => Promise<TData>
  invalidateKey: readonly unknown[]
}

export function createResourceMutationHook<TVariables, TData>(
  config: ResourceMutationConfig<TVariables, TData>
) {
  return function useResourceMutation(
    options?: Omit<
      UseMutationOptions<TData, Error, TVariables>,
      "mutationFn" | "mutationKey"
    >
  ) {
    const queryClient = useQueryClient()

    return useMutation({
      ...options,
      mutationFn: config.mutationFn,
      mutationKey: config.mutationKey,
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: config.invalidateKey })
        options?.onSuccess?.(...args)
      },
    })
  }
}
