import { ComponentProps } from "react"

export type FormState = "CREATING" | "READING" | "UPDATING" | "DELETING"

export type CommonFormValuesProps<
  Default = Record<string, unknown>,
  Custom = Record<string, unknown>,
> = {
  customValues?: Partial<Custom>
  defaultValues?: Partial<Default>
  isDisabled?: boolean
  isLoading?: boolean
  state?: FormState
}

export type CommonFormProps<
  Default = Record<string, unknown>,
  Custom = Record<string, unknown>,
> = CommonFormValuesProps<Default, Custom> & {
  onCancel?: () => void
  onSubmit?: (data: Default) => void
  onError?: (error: string) => void
} & Omit<ComponentProps<"form">, "onSubmit">
