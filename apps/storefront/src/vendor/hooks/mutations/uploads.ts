import { uploadVendorImages } from "@/vendor/lib/client"
import { useMutation } from "@tanstack/react-query"
import { mutationKeys } from "./mutation-keys"

export const useUploadVendorImages = () =>
  useMutation({
    mutationKey: mutationKeys.uploads.uploadVendorImages,
    mutationFn: uploadVendorImages,
  })
