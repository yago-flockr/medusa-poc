
export type CustomListQuery = {
  fields?: string
  limit?: number
  offset?: number
  order?: string
  with_deleted?: boolean
}

export type CustomListResponse<TResource extends string, TItem> = {
  [K in TResource]: TItem[]
} & {
  count: number
  limit: number
  offset: number
}
