import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { VENDOR_MODULE } from "../src/modules/vendor"
import { updateStorefrontContentWorkflow } from "../src/workflows/shared/update-storefront-content"
import { createVendorWorkflow } from "../src/workflows/vendors/create-vendor"
import { createVendorUserWorkflow } from "../src/workflows/vendor-users/create-vendor-user"
import { createVendorProductWorkflow } from "../src/workflows/vendor-products/create-vendor-product"
import { updateVendorProductWorkflow } from "../src/workflows/vendor-products/update-vendor-product"
import { getVendorProductWorkflow } from "../src/workflows/vendor-products/get-vendor-product"
import { setVendorInventoryLevelWorkflow } from "../src/workflows/vendor-products/set-vendor-inventory-level"
import { createVendorStockLocationWorkflow } from "../src/workflows/vendor-stock-locations/create-vendor-stock-location"
import type { VendorVariantInput } from "../src/workflows/vendor-products/mappers/resolve-product-variants"

type ProductFixture = {
  title: string
  description: string
  optionValues: string[]
  basePrice: number
  images: string[]
  collection: string
}

type VendorFixture = {
  name: string
  handle: string
  email: string
  password: string
  firstName: string
  description: string
  location: {
    name: string
    address_1: string
    city: string
    province: string
    postal_code: string
    country_code: string
  }
  products: ProductFixture[]
}

const TEE_IMAGES = [
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
]
const SWEATSHIRT_IMAGES = [
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
]
const SHORTS_IMAGES = [
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png",
]

const SEED_STOCK_QUANTITY = 100

// Fixed, memorable fixtures (asd@asd.com etc.), not faker-generated ones.
const VENDOR_FIXTURES: VendorFixture[] = [
  {
    name: "Asd Apparel",
    handle: "asd-apparel",
    email: "asd@asd.com",
    password: "asd",
    firstName: "Asd",
    description:
      "A small studio making considered basics, reviewed and approved before anything goes live.",
    location: {
      name: "Asd Apparel Warehouse",
      address_1: "1 Test Street",
      city: "London",
      province: "London",
      postal_code: "E1 6AN",
      country_code: "gb",
    },
    products: [
      {
        title: "Classic Tee",
        description: "A timeless, comfortable everyday t-shirt.",
        optionValues: ["S", "M", "L"],
        basePrice: 20,
        images: TEE_IMAGES,
        collection: "New Arrivals",
      },
      {
        title: "Vintage Sweatshirt",
        description: "A cozy sweatshirt with a vintage finish.",
        optionValues: ["S", "M", "L"],
        basePrice: 35,
        images: SWEATSHIRT_IMAGES,
        collection: "New Arrivals",
      },
      {
        title: "Boxy Cotton Overshirt",
        description:
          "A relaxed overshirt cut from heavy brushed cotton, built to layer.",
        optionValues: ["S", "M", "L"],
        basePrice: 78,
        images: SWEATSHIRT_IMAGES,
        collection: "New Arrivals",
      },
      {
        title: "Garment-Dyed Pocket Tee",
        description:
          "Dyed after stitching so the colour settles unevenly and softens with wear.",
        optionValues: ["S", "M", "L"],
        basePrice: 32,
        images: TEE_IMAGES,
        collection: "New Arrivals",
      },
      {
        title: "Heavyweight Loopback Sweat",
        description:
          "Loopback cotton at 480gsm, milled slowly so the pile stays dense.",
        optionValues: ["S", "M", "L"],
        basePrice: 96,
        images: SWEATSHIRT_IMAGES,
        collection: "The Winter Edit",
      },
      {
        title: "Wide-Leg Drawcord Trouser",
        description: "An unstructured trouser with a soft drawcord waist.",
        optionValues: ["S", "M", "L"],
        basePrice: 84,
        images: SHORTS_IMAGES,
        collection: "The Winter Edit",
      },
      {
        title: "Panelled Running Short",
        description: "A light technical short with bonded, chafe-free seams.",
        optionValues: ["S", "M", "L"],
        basePrice: 46,
        images: SHORTS_IMAGES,
        collection: "Best of Nike",
      },
      {
        title: "Mesh-Back Training Tee",
        description: "An open mesh back panel keeps this tee moving air.",
        optionValues: ["S", "M", "L"],
        basePrice: 38,
        images: TEE_IMAGES,
        collection: "Best of Nike",
      },
      {
        title: "Everyday Crew Three-Pack",
        description: "Three plain crew-neck tees, cut from the same cotton.",
        optionValues: ["S", "M", "L"],
        basePrice: 26,
        images: TEE_IMAGES,
        collection: "Cheap Clothes",
      },
      {
        title: "Last-Season Fleece Half-Zip",
        description: "A previous-season fleece, marked down, otherwise perfect.",
        optionValues: ["S", "M", "L"],
        basePrice: 42,
        images: SWEATSHIRT_IMAGES,
        collection: "Outlet",
      },
    ],
  },
  {
    name: "Zxc Threads",
    handle: "zxc-threads",
    email: "zxc@zxc.com",
    password: "zxc",
    firstName: "Zxc",
    description:
      "Independent house, hand-forged pieces, small runs never reordered.",
    location: {
      name: "Zxc Threads Warehouse",
      address_1: "2 Test Street",
      city: "Manchester",
      province: "Manchester",
      postal_code: "M1 1AE",
      country_code: "gb",
    },
    products: [
      {
        title: "Weekend Shorts",
        description: "Relaxed-fit shorts for warm days.",
        optionValues: ["S", "M", "L"],
        basePrice: 25,
        images: SHORTS_IMAGES,
        collection: "Summer Collection",
      },
      {
        title: "Everyday Tee",
        description: "A soft cotton tee for daily wear.",
        optionValues: ["S", "M", "L"],
        basePrice: 18,
        images: TEE_IMAGES,
        collection: "Summer Collection",
      },
      {
        title: "Open-Weave Linen Shirt",
        description:
          "A loose linen weave that moves air, finished with shell buttons.",
        optionValues: ["S", "M", "L"],
        basePrice: 88,
        images: TEE_IMAGES,
        collection: "Summer Collection",
      },
      {
        title: "Pleated Poplin Short",
        description: "A single forward pleat gives this short its clean drape.",
        optionValues: ["S", "M", "L"],
        basePrice: 54,
        images: SHORTS_IMAGES,
        collection: "Summer Collection",
      },
      {
        title: "Merino Crew Knit",
        description:
          "Fine-gauge merino, knitted whole so there are no shoulder seams.",
        optionValues: ["S", "M", "L"],
        basePrice: 112,
        images: SWEATSHIRT_IMAGES,
        collection: "The Winter Edit",
      },
      {
        title: "Brushed Flannel Overshirt",
        description: "Double-brushed flannel with a deep, quiet nap.",
        optionValues: ["S", "M", "L"],
        basePrice: 74,
        images: SWEATSHIRT_IMAGES,
        collection: "The Winter Edit",
      },
      {
        title: "Court Canvas Warm-Up",
        description: "A boxy warm-up top in dense cotton canvas.",
        optionValues: ["S", "M", "L"],
        basePrice: 92,
        images: SWEATSHIRT_IMAGES,
        collection: "Best of Nike",
      },
      {
        title: "Ribbed Training Short",
        description: "A close-ribbed knit short that holds its shape.",
        optionValues: ["S", "M", "L"],
        basePrice: 44,
        images: SHORTS_IMAGES,
        collection: "Best of Nike",
      },
      {
        title: "Basic Jersey Short",
        description: "A plain jersey short, honest about what it is.",
        optionValues: ["S", "M", "L"],
        basePrice: 22,
        images: SHORTS_IMAGES,
        collection: "Cheap Clothes",
      },
      {
        title: "Archive Logo Sweat",
        description: "An archive print, discounted to clear the last run.",
        optionValues: ["S", "M", "L"],
        basePrice: 48,
        images: SWEATSHIRT_IMAGES,
        collection: "Outlet",
      },
    ],
  },
]

const collectionIdCache = new Map<string, string>()

async function resolveCollectionId(
  container: ExecArgs["container"],
  title: string,
) {
  const cached = collectionIdCache.get(title)

  if (cached) {
    return cached
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const handle = title.toLowerCase().replace(/\s+/g, "-")

  const { data: existing } = await query.graph({
    entity: "product_collection",
    fields: ["id"],
    filters: { handle },
  })

  const id =
    existing[0]?.id ??
    (
      await createCollectionsWorkflow(container).run({
        input: { collections: [{ title, handle }] },
      })
    ).result[0].id

  collectionIdCache.set(title, id)

  return id
}

export default async function seedVendors({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Seeding demo vendors, vendor users, locations, and products...")

  for (const vendorFixture of VENDOR_FIXTURES) {
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
        input: { name: vendorFixture.name, handle: vendorFixture.handle },
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
        `Vendor user "${vendorFixture.email}" already exists, skipping — password is the fixed "${vendorFixture.password}" from VENDOR_FIXTURES.`,
      )
    } else {
      const { result: vendorUser } = await createVendorUserWorkflow(
        container,
      ).run({
        input: {
          vendor_id: vendorId,
          email: vendorFixture.email,
          password: vendorFixture.password,
          first_name: vendorFixture.firstName,
        },
      })
      vendorUserId = vendorUser.vendor_user.id
      logger.info(
        `Vendor login for "${vendorFixture.name}" — email: ${vendorUser.vendor_user.email}  password: ${vendorUser.password}`,
      )
    }

    const { data: existingStockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id"],
      filters: { vendor: { id: vendorId } },
    })

    let locationId = existingStockLocations[0]?.id

    if (locationId) {
      logger.info(
        `Location for "${vendorFixture.name}" already exists, skipping.`,
      )
    } else {
      // Same workflow the vendor panel's own "create location" action calls
      // — auto-provisions free shipping for it, nothing extra to seed here.
      const location = await createVendorStockLocationWorkflow(container).run({
        input: {
          actorId: vendorUserId,
          name: vendorFixture.location.name,
          address: {
            address_1: vendorFixture.location.address_1,
            city: vendorFixture.location.city,
            province: vendorFixture.location.province,
            postal_code: vendorFixture.location.postal_code,
            country_code: vendorFixture.location.country_code,
          },
        },
      })
      locationId = location.result.stock_location.id
    }

    for (const productFixture of vendorFixture.products) {
      const handle = `${vendorFixture.handle}-${productFixture.title
        .toLowerCase()
        .replace(/\s+/g, "-")}`

      const { data: existingProducts } = await query.graph({
        entity: "product",
        fields: ["id"],
        filters: { handle },
      })

      const collectionId = await resolveCollectionId(
        container,
        productFixture.collection,
      )

      if (existingProducts[0]) {
        logger.info(`Product "${handle}" already exists, skipping.`)
        continue
      }

      const options = [{ title: "Size", values: productFixture.optionValues }]
      const variants: VendorVariantInput[] = productFixture.optionValues.map(
        (value, index) => ({
          optionValues: { Size: value },
          price: productFixture.basePrice + index * 5,
          sku: `${handle}-${value}`.toUpperCase(),
        }),
      )

      const { result: createdProduct } = await createVendorProductWorkflow(
        container,
      ).run({
        input: {
          actorId: vendorUserId,
          title: productFixture.title,
          description: productFixture.description,
          handle,
          images: productFixture.images.map((url) => ({ url })),
          options,
          variants,
        },
      })

      // Real submissions default to PROPOSED; seeded ones publish outright —
      // same path a vendor's own "publish" action takes.
      await updateVendorProductWorkflow(container).run({
        input: {
          actorId: vendorUserId,
          productId: createdProduct.id,
          status: ProductStatus.PUBLISHED,
        },
      })

      await updateProductsWorkflow(container).run({
        input: {
          selector: { id: createdProduct.id },
          update: { collection_id: collectionId },
        },
      })

      const { result: productDetail } = await getVendorProductWorkflow(
        container,
      ).run({
        input: { actorId: vendorUserId, productId: createdProduct.id },
      })

      for (const variant of productDetail.variants) {
        await setVendorInventoryLevelWorkflow(container).run({
          input: {
            actorId: vendorUserId,
            productId: createdProduct.id,
            variantId: variant.id,
            locationId,
            quantity: SEED_STOCK_QUANTITY,
          },
        })
      }

      logger.info(
        `Created vendor product "${productFixture.title}" for "${vendorFixture.name}" (${variants.length} variants, ${SEED_STOCK_QUANTITY} stock each at "${vendorFixture.location.name}").`,
      )
    }
  }

  logger.info("Finished seeding demo vendors.")
}
