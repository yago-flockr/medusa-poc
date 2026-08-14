import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query"

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
