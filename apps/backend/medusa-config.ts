import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  featureFlags: {
    view_configurations: true,
  },
  modules: [
    { resolve: "./src/modules/brand" },
    { resolve: "./src/modules/vendor" },
    { resolve: "./src/modules/affiliate" },
    { resolve: "./src/modules/storefront-content" },
    { resolve: "@medusajs/medusa/event-bus-redis" },
    { resolve: "@medusajs/medusa/workflow-engine-redis" },
    {
      resolve: "@medusajs/medusa/settings",
      options: {
        entityOverrides: {
          Product: {
            defaultVisibleFields: ["vendor.name"],
            defaultFieldOrdering: { "vendor.name": 250 },
          },
        },
      },
    },
  ],
  projectConfig: {
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
})
