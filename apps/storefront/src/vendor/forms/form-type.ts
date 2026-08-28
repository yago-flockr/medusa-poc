export type CommonFormProps<TValues> = {
  defaultValues?: Partial<TValues>
  isLoading?: boolean
  onSubmit: (values: TValues) => void | Promise<void>
}
