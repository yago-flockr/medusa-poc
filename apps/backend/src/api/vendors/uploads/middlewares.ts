import type {
  MedusaRequestHandler,
  MiddlewareRoute,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import multer from "multer"

const MAX_FILES = 5
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILES,
  },
})

const arrayUpload = upload.array("files", MAX_FILES)

export const vendorUploadMiddleware: MedusaRequestHandler = (
  req,
  res,
  next,
) => {
  arrayUpload(req, res, (err: unknown) => {
    if (!err) {
      next()
      return
    }

    const code = (err as { code?: string }).code

    if (code === "LIMIT_FILE_SIZE") {
      next(
        new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB per file.`,
        ),
      )
      return
    }

    if (code === "LIMIT_FILE_COUNT" || code === "LIMIT_UNEXPECTED_FILE") {
      next(
        new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Too many files. Maximum is ${MAX_FILES} files per upload.`,
        ),
      )
      return
    }

    next(
      new MedusaError(
        MedusaError.Types.INVALID_DATA,
        (err as Error).message ?? "File upload failed.",
      ),
    )
  })
}

export const vendorUploadRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/vendors/uploads",
    middlewares: [vendorUploadMiddleware],
  },
]
