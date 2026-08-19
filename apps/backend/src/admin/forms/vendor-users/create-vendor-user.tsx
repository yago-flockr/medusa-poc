import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { Button, FocusModal } from "@medusajs/ui"
import { Controller, useForm } from "react-hook-form"
import {
  createVendorUserSchema,
  type CreateVendorUser,
} from "../../../api/admin/vendor-users/contract"
import { TitleSubtitle } from "../../components/title-subtitle"
import { SelectField, type SelectFieldOption } from "../fields/select-field"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export type CreateVendorUserFormProps = CommonFormProps<CreateVendorUser> & {
  vendorOptions: SelectFieldOption[]
}

export const CreateVendorUserForm = ({
  defaultValues,
  isDisabled,
  isLoading,
  onCancel,
  onSubmit,
  vendorOptions,
}: CreateVendorUserFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<
    z.input<typeof createVendorUserSchema>,
    unknown,
    CreateVendorUser
  >({
    resolver: zodResolver(createVendorUserSchema),
    defaultValues: {
      vendor_id: "",
      email: "",
      first_name: "",
      last_name: "",
      ...defaultValues,
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values)
  })

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
      <FocusModal.Header />
      <FocusModal.Body className="flex flex-1 flex-col items-center overflow-y-auto py-16">
        <div className="flex w-full max-w-[720px] flex-col gap-y-8">
          <TitleSubtitle
            title="Create Vendor User"
            description="A random password is generated automatically — it's shown once after creation, so copy it and share it with the vendor yourself. There is no invite email yet."
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="vendor_id"
              render={({ field }) => (
                <SelectField
                  id="create-vendor-user-vendor"
                  label="Vendor"
                  placeholder="Select a vendor"
                  options={vendorOptions}
                  error={errors.vendor_id?.message}
                  disabled={isDisabled || isLoading}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
            <TextField
              id="create-vendor-user-email"
              label="Email"
              type="email"
              error={errors.email?.message}
              disabled={isDisabled || isLoading}
              {...register("email")}
            />
            <TextField
              id="create-vendor-user-first-name"
              label="First name"
              optional
              error={errors.first_name?.message}
              disabled={isDisabled || isLoading}
              {...register("first_name")}
            />
            <TextField
              id="create-vendor-user-last-name"
              label="Last name"
              optional
              error={errors.last_name?.message}
              disabled={isDisabled || isLoading}
              {...register("last_name")}
            />
          </div>
        </div>
      </FocusModal.Body>
      <FocusModal.Footer>
        <div className="flex items-center justify-end gap-x-2">
          <Button
            size="small"
            variant="secondary"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="small"
            type="submit"
            isLoading={isLoading}
            disabled={isDisabled}
          >
            Create
          </Button>
        </div>
      </FocusModal.Footer>
    </form>
  )
}
