import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ProductStatus,
} from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { graph } from "../src/lib/query"
import { VENDOR_MODULE } from "../src/modules/vendor"
import { updateStorefrontContentWorkflow } from "../src/workflows/shared/update-storefront-content"
import { createVendorWorkflow } from "../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../src/workflows/vendor-users/create-vendor-user"
import { createVendorProductWorkflow } from "../src/workflows/vendor-products/create-vendor-product"
import { updateVendorProductWorkflow } from "../src/workflows/vendor-products/update-vendor-product"
import { getVendorProductWorkflow } from "../src/workflows/vendor-products/get-vendor-product"
import { setVendorInventoryLevelWorkflow } from "../src/workflows/vendor-products/set-vendor-inventory-level"
import { createVendorStockLocationWorkflow } from "../src/workflows/vendor-stock-locations/create-vendor-stock-location"
import { SEED_CONFIG } from "./seed-config"
import { buildSeedPlan } from "./seed-plan"

function mapIdsByHandle(
  entity: string,
  handles: string[],
  rows: { id: string; handle: string }[],
) {
  const idByHandle = new Map(rows.map((row) => [row.handle, row.id]))
  const missing = handles.filter((handle) => !idByHandle.has(handle))

  if (missing.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Run seed:categories and seed:collections before seed:vendors — missing ${entity}: ${missing.join(", ")}`,
    )
  }

  return idByHandle
}

export default async function seedVendors({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const plan = buildSeedPlan(SEED_CONFIG)

  const categoryHandles = plan.categories.map((category) => category.handle)
  const { data: categories } = await graph(query, {
    entity: "product_category",
    fields: ["id", "handle"],
    filters: { handle: categoryHandles },
  })
  const categoryIds = mapIdsByHandle("categories", categoryHandles, categories)

  const collectionHandles = plan.collections.map(
    (collection) => collection.handle,
  )
  const { data: collections } = await graph(query, {
    entity: "product_collection",
    fields: ["id", "handle"],
    filters: { handle: collectionHandles },
  })
  const collectionIds = mapIdsByHandle(
    "collections",
    collectionHandles,
    collections,
  )

  for (const vendorFixture of plan.vendors) {
    const { data: existingVendors } = await query.graph({
      entity: "vendor",
      fields: ["id"],
      filters: { handle: vendorFixture.handle },
    })

    let vendorId = existingVendors[0]?.id

    if (vendorId) {
      logger.info(`Vendor "${vendorFixture.name}" already exists, skipping.`)
    } else {
      const { result: vendor } = await createVendorWorkflow(container).run({
        input: {
          name: vendorFixture.name,
          handle: vendorFixture.handle,
          commission_rate: vendorFixture.commissionRate,
        },
      })
      vendorId = vendor.id
    }

    await updateStorefrontContentWorkflow(container).run({
      input: {
        linkModuleKey: VENDOR_MODULE,
        linkIdField: "vendor_id",
        queryEntity: "vendor",
        entityId: vendorId,
        name: vendorFixture.name,
        description: vendorFixture.description,
      },
    })

    const { data: existingVendorUsers } = await query.graph({
      entity: "vendor_user",
      fields: ["id"],
      filters: { email: vendorFixture.email },
    })

    let vendorUserId = existingVendorUsers[0]?.id

    if (vendorUserId) {
      logger.info(
        `Vendor user "${vendorFixture.email}" already exists, skipping.`,
      )
    } else {
      const { result: vendorUser } = await createVendorUserWorkflow(
        container,
      ).run({
        input: {
          vendor_id: vendorId,
          email: vendorFixture.email,
          password: vendorFixture.password,
          name: vendorFixture.userName,
        },
      })
      vendorUserId = vendorUser.vendor_user.id
      logger.info(
        `Vendor login for "${vendorFixture.name}" — email: ${vendorUser.vendor_user.email}  password: ${vendorUser.password}`,
      )
    }

    const { data: existingLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name"],
      filters: { vendor: { id: vendorId } },
    })
    const locationIds: string[] = []

    for (const location of vendorFixture.locations) {
      const existing = existingLocations.find(
        (candidate) => candidate?.name === location.name,
      )

      if (existing) {
        locationIds.push(existing.id)
        continue
      }

      const { result } = await createVendorStockLocationWorkflow(container).run(
        {
          input: {
            actorId: vendorUserId,
            name: location.name,
            address: location.address,
          },
        },
      )
      locationIds.push(result.stock_location.id)
    }

    for (const productFixture of vendorFixture.products) {
      const { data: existingProducts } = await query.graph({
        entity: "product",
        fields: ["id"],
        filters: { handle: productFixture.handle },
      })

      if (existingProducts[0]) {
        logger.info(
          `Product "${productFixture.handle}" already exists, skipping.`,
        )
        continue
      }

      const { result: createdProduct } = await createVendorProductWorkflow(
        container,
      ).run({
        input: {
          actorId: vendorUserId,
          title: productFixture.title,
          description: productFixture.description,
          handle: productFixture.handle,
          images: productFixture.images.map((url) => ({ url })),
          category_ids: productFixture.categoryHandles.map(
            (handle) => categoryIds.get(handle)!,
          ),
          options: productFixture.options,
          variants: productFixture.variants,
        },
      })

      await updateVendorProductWorkflow(container).run({
        input: {
          actorId: vendorUserId,
          productId: createdProduct.id,
          status: ProductStatus.PUBLISHED,
        },
      })

      if (productFixture.collectionHandle) {
        await updateProductsWorkflow(container).run({
          input: {
            selector: { id: createdProduct.id },
            update: {
              collection_id: collectionIds.get(productFixture.collectionHandle),
            },
          },
        })
      }

      const { result: productDetail } = await getVendorProductWorkflow(
        container,
      ).run({
        input: { actorId: vendorUserId, productId: createdProduct.id },
      })

      const stockBySku = new Map(
        productFixture.variants.map((variant) => [variant.sku, variant.stock]),
      )

      for (const variant of productDetail.variants) {
        for (const locationId of locationIds) {
          await setVendorInventoryLevelWorkflow(container).run({
            input: {
              actorId: vendorUserId,
              productId: createdProduct.id,
              variantId: variant.id,
              locationId,
              quantity: stockBySku.get(variant.sku!)!,
            },
          })
        }
      }

      logger.info(
        `Created "${productFixture.title}" for "${vendorFixture.name}" (${productDetail.variants.length} variants × ${locationIds.length} locations).`,
      )
    }
  }

  logger.info("Finished seeding vendors.")
}
