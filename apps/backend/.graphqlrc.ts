import { shopifyApiProject, ApiType } from "@shopify/api-codegen-preset"

export default {
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Admin,
      apiVersion: "2026-01",
      documents: ["./src/lib/shopify-test-pull.ts"],
      outputDir: "./src/lib/generated",
    }),
  },
}
