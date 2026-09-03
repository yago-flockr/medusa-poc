import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { RiAddLine, RiCloseLine, RiImageLine } from "@remixicon/react"
import { useRef, useState } from "react"

const MAX_IMAGES = 5

type ImagesFieldProps = {
  images: string[]
  onChange: (images: string[]) => void
  onUploadImages: (files: File[]) => Promise<string[]>
  isUploadingImages?: boolean
}

export function ImagesField({
  images,
  onChange,
  onUploadImages,
  isUploadingImages,
}: ImagesFieldProps) {
  const [pendingUploads, setPendingUploads] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImagesSelected(files: FileList | null) {
    if (!files?.length) return

    const remaining = MAX_IMAGES - images.length
    const picked = Array.from(files).slice(0, remaining)

    setPendingUploads(picked.length)
    try {
      const uploaded = await onUploadImages(picked)
      onChange([...images, ...uploaded])
    } finally {
      setPendingUploads(0)
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-sm font-medium">Images</p>
      <AttachmentGroup>
        {images.map((url, index) => (
          <Attachment key={url} orientation="vertical" size="sm" state="done">
            <AttachmentMedia variant="image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>Image {index + 1}</AttachmentTitle>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction
                aria-label="Remove image"
                onClick={() =>
                  onChange(images.filter((image) => image !== url))
                }
              >
                <RiCloseLine />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        ))}

        {Array.from({ length: pendingUploads }).map((_, index) => (
          <Attachment
            // eslint-disable-next-line react/no-array-index-key
            key={`uploading-${index}`}
            orientation="vertical"
            size="sm"
            state="uploading"
          >
            <AttachmentMedia>
              <RiImageLine />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>Uploading…</AttachmentTitle>
            </AttachmentContent>
          </Attachment>
        ))}

        {images.length < MAX_IMAGES && (
          <Attachment orientation="vertical" size="sm" state="idle">
            <AttachmentTrigger
              aria-label="Add image"
              disabled={isUploadingImages}
              onClick={() => fileInputRef.current?.click()}
            />
            <AttachmentMedia>
              <RiAddLine />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>Add image</AttachmentTitle>
            </AttachmentContent>
          </Attachment>
        )}
      </AttachmentGroup>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          handleImagesSelected(event.target.files)
          event.target.value = ""
        }}
      />
    </div>
  )
}
