export type FormState = "READING" | "CREATING" | "UPDATING" | "DELETING"

export const isCreating = (state: FormState) => state === "CREATING"
export const isUpdating = (state: FormState) => state === "UPDATING"
export const isDeleting = (state: FormState) => state === "DELETING"
export const isReading = (state: FormState) => state === "READING"

export type CommonFormProps<TValues> = {
  defaultValues?: Partial<TValues>
  isDisabled?: boolean
  isLoading?: boolean
  state?: FormState
  onCancel?: () => void
  onSubmit?: (data: TValues) => void | Promise<void>
}
