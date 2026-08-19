import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "@medusajs/framework/zod"
import { Button, FocusModal } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import {
  createBrandSchema,
  type CreateBrand,
} from "../../../api/admin/brands/contract"
import { TitleSubtitle } from "../../components/title-subtitle"
import { TextField } from "../fields/text-field"
import type { CommonFormProps } from "../form-type"

export type CreateBrandFormProps = CommonFormProps<CreateBrand>

export const CreateBrandForm = ({
  defaultValues,
  isDisabled,
  isLoading,
  onCancel,
  onSubmit,
}: CreateBrandFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof createBrandSchema>, unknown, CreateBrand>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      name: "",
      handle: "",
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
            title="Create Brand"
            description="Create a new brand and manage its details."
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField
              id="create-brand-name"
              label="Name"
              error={errors.name?.message}
              disabled={isDisabled || isLoading}
              {...register("name")}
            />
            <TextField
              id="create-brand-handle"
              label="Handle"
              optional
              placeholder="acme"
              error={errors.handle?.message}
              disabled={isDisabled || isLoading}
              {...register("handle")}
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
