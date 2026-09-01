import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  featureFlags: {
    view_configurations: true,
  },
  modules: [
    { resolve: "./src/modules/brand" },
    { resolve: "./src/modules/vendor" },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: { redis: { redisUrl: process.env.REDIS_URL } },
    },
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
