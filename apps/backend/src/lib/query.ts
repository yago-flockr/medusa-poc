import type {
  GraphResultSet,
  RemoteJoinerOptions,
  RemoteQueryEntryPoints,
  RemoteQueryFunction,
  RemoteQueryInput,
} from "@medusajs/framework/types"

export type QueryEntity = keyof RemoteQueryEntryPoints

type FieldKey<T> = Exclude<keyof T & string, "__typename">

type Related<T> =
  NonNullable<T> extends Array<infer R> ? NonNullable<R> : NonNullable<T>

type NestedField<T> = {
  [K in FieldKey<T>]: Related<T[K]> extends object
    ? K | `${K}.*` | `${K}.${FieldKey<Related<T[K]>>}`
    : K
}[FieldKey<T>]

type SuggestedField<T> =
  | "*"
  | {
      [K in FieldKey<T>]: Related<T[K]> extends object
        ? K | `${K}.*` | `${K}.${NestedField<Related<T[K]>>}`
        : K
    }[FieldKey<T>]

// Query resolves field paths of unbounded depth, so this suggests without restricting.
type GraphField<T> = SuggestedField<T> | (string & {})

export type GraphInput<TEntity extends QueryEntity> = Omit<
  RemoteQueryInput<TEntity>,
  "entity" | "fields"
> & {
  entity: TEntity
  fields: GraphField<RemoteQueryEntryPoints[TEntity]>[]
}

export const graph = <const TEntity extends QueryEntity>(
  query: Pick<RemoteQueryFunction, "graph">,
  input: GraphInput<TEntity>,
  options?: RemoteJoinerOptions,
): Promise<GraphResultSet<TEntity>> =>
  // TS cannot resolve RemoteQueryInput's conditional inside a generic body; the cast only widens.
  query.graph(input as RemoteQueryInput<TEntity>, options)
