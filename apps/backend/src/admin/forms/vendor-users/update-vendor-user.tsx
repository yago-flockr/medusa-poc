import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { Button, Drawer, Text } from "@medusajs/ui"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  updateVendorUserSchema,
  type UpdateVendorUser,
  type VendorUser,
} from "../../../api/admin/vendor-users/contract"
import { TitleSubtitle } from "../../components/title-subtitle"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export type UpdateVendorUserFormProps = CommonFormProps<UpdateVendorUser> & {
  vendorUser: VendorUser | null
}

export function vendorUserToForm(vendorUser: VendorUser): UpdateVendorUser {
  return {
    first_name: vendorUser.first_name ?? undefined,
    last_name: vendorUser.last_name ?? undefined,
  }
}

export const UpdateVendorUserForm = ({
  defaultValues,
  isDisabled,
  isLoading,
  onCancel,
  onSubmit,
  vendorUser,
}: UpdateVendorUserFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<
    z.input<typeof updateVendorUserSchema>,
    unknown,
    UpdateVendorUser
  >({
    resolver: zodResolver(updateVendorUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      ...defaultValues,
    },
  })

  useEffect(() => {
    reset({
      first_name: defaultValues?.first_name ?? "",
      last_name: defaultValues?.last_name ?? "",
    })
  }, [defaultValues?.first_name, defaultValues?.last_name, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values)
  })

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
      <Drawer.Header>
        <TitleSubtitle title="Update Vendor User" />
      </Drawer.Header>
      <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col space-y-2">
            <Text size="small" weight="plus">
              Email
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              {vendorUser?.email}
            </Text>
          </div>
          <TextField
            id="update-vendor-user-first-name"
            label="First name"
            optional
            error={errors.first_name?.message}
            disabled={isDisabled || isLoading}
            {...register("first_name")}
          />
          <TextField
            id="update-vendor-user-last-name"
            label="Last name"
            optional
            error={errors.last_name?.message}
            disabled={isDisabled || isLoading}
            {...register("last_name")}
          />
        </div>
      </Drawer.Body>
      <Drawer.Footer>
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
            Save
          </Button>
        </div>
      </Drawer.Footer>
    </form>
  )
}
