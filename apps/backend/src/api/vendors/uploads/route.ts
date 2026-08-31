import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { vendorUploadResponseSchema } from "@dtc/api-contracts/vendor/uploads"

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
])

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const files = req.files as Express.Multer.File[] | undefined

  if (!files?.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No files were uploaded.",
    )
  }

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unsupported file type: ${file.mimetype}. Allowed: PNG, JPEG, WEBP, GIF.`,
      )
    }
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: files.map((file) => ({
        filename: file.originalname,
        mimeType: file.mimetype,
        content: file.buffer.toString("base64"),
        access: "public",
      })),
    },
  })

  res.json(
    vendorUploadResponseSchema.parse({
      files: result.map((file) => ({ id: file.id, url: file.url })),
    }),
  )
}
