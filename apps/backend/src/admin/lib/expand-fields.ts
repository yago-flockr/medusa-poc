export type ExpandField<T> = {
  fields: string
  readonly _type: T
}

export const expandField = <T>(fields: string): ExpandField<T> => ({
  fields,
  _type: undefined as T,
})

export type ExpandSelection<
  TRegistry extends Record<string, ExpandField<unknown>>,
  TKeys extends keyof TRegistry,
> = {
  [K in TKeys]?: TRegistry[K]["_type"]
}

export const expandFields = <
  TRegistry extends Record<string, ExpandField<unknown>>,
  TKeys extends keyof TRegistry,
>(
  registry: TRegistry,
  keys: TKeys[]
): string => keys.map((key) => registry[key].fields).join(",")
