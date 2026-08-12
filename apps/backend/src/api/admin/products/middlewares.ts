import type { MiddlewareRoute } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const productMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/products",
    method: ["POST"],
    additionalDataValidator: {
      brand_id: z.string().optional(),
    },
  },
]
