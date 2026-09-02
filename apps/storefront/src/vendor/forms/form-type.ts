export type FormState = "CREATING" | "READING" | "UPDATING" | "DELETING"

export interface CommonFormValuesProps<
  Default = Record<string, any>,
  Custom = Record<string, any>,
> {
  customValues?: Partial<Custom>
  defaultValues?: Partial<Default>
  isDisabled?: boolean
  isLoading?: boolean
  state?: FormState
}

export interface CommonFormProps<
  Default = Record<string, any>,
  Custom = Record<string, any>,
> extends CommonFormValuesProps<Default, Custom> {
  onCancel?: () => void
  onSubmit?: (data: Default & Partial<Custom>) => void
  onError?: (error: string) => void
}
