import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { Button, Drawer, Text } from "@medusajs/ui"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { Vendor } from "../../../api/admin/vendors/contract"
import { TitleSubtitle } from "../../components/title-subtitle"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

const updateVendorFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  handle: z.string().trim().min(1, "Handle is required"),
})

export type UpdateVendorFormValues = z.infer<typeof updateVendorFormSchema>
export type UpdateVendorFormProps = CommonFormProps<UpdateVendorFormValues>

export function vendorToForm(vendor: Vendor): UpdateVendorFormValues {
  return {
    name: vendor.name,
    handle: vendor.handle,
  }
}

export const UpdateVendorForm = ({
  defaultValues,
  isDisabled,
  isLoading,
  onCancel,
  onSubmit,
  vendor,
}: UpdateVendorFormProps & { vendor: Vendor | null }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateVendorFormValues>({
    resolver: zodResolver(updateVendorFormSchema),
    defaultValues: {
      name: "",
      handle: "",
      ...defaultValues,
    },
  })

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? "",
      handle: defaultValues?.handle ?? "",
    })
  }, [defaultValues?.name, defaultValues?.handle, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values)
  })

  const users = vendor?.users ?? []

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
      <Drawer.Header>
        <TitleSubtitle title="Update Vendor" />
      </Drawer.Header>
      <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
          <TextField
            id="update-vendor-name"
            label="Name"
            error={errors.name?.message}
            disabled={isDisabled || isLoading}
            {...register("name")}
          />
          <TextField
            id="update-vendor-handle"
            label="Handle"
            placeholder="acme"
            error={errors.handle?.message}
            disabled={isDisabled || isLoading}
            {...register("handle")}
          />
        </div>
        <div>
          <Text size="small" weight="plus" className="mb-2">
            Users
          </Text>
          {users.length === 0 ? (
            <Text size="small" className="text-ui-fg-subtle">
              No users yet.
            </Text>
          ) : (
            <ul className="flex flex-col gap-y-1">
              {users.map((user) => (
                <li key={user.id}>
                  <Text size="small">
                    {[user.first_name, user.last_name]
                      .filter(Boolean)
                      .join(" ") || user.email}{" "}
                    <span className="text-ui-fg-subtle">({user.email})</span>
                  </Text>
                </li>
              ))}
            </ul>
          )}
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
