export type FormState = "CREATING" | "READING" | "UPDATING" | "DELETING"

export interface CommonFormValuesProps<
  Default = Record<string, unknown>,
  Custom = Record<string, unknown>,
> {
  customValues?: Partial<Custom>
  defaultValues?: Partial<Default>
  isDisabled?: boolean
  isLoading?: boolean
  state?: FormState
}

export interface CommonFormProps<
  Default = Record<string, unknown>,
  Custom = Record<string, unknown>,
> extends CommonFormValuesProps<Default, Custom> {
  onCancel?: () => void
  onSubmit?: (data: Default) => void
  onError?: (error: string) => void
}
