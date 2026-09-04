import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import { createVendorWorkflow } from "../src/workflows/create-vendor"
import { createVendorUserWorkflow } from "../src/workflows/create-vendor-user"
import { createVendorProductWorkflow } from "../src/workflows/create-vendor-product"
import { createVendorStockLocationWorkflow } from "../src/workflows/create-vendor-stock-location"
import { setVendorInventoryLevelWorkflow } from "../src/workflows/set-vendor-inventory-level"
import { resolveStorePrerequisites } from "../src/lib/resolve-store-prerequisites"
import {
  resolveProductVariants,
  type VendorVariantInput,
} from "../src/api/vendors/products/build-variants"

type ProductFixture = {
  title: string
  description: string
  optionValues: string[]
  basePrice: number
  images: string[]
}

type VendorFixture = {
  name: string
  handle: string
  email: string
  password: string
  firstName: string
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

// Fixed, memorable test fixtures — not randomly generated. A POC's seed
// data exists so anyone on the team can log in with a login they actually
// remember (`asd@asd.com` / `zxc@zxc.com`), not a different faker-generated
// email every time someone rebuilds the fixture list.
const VENDOR_FIXTURES: VendorFixture[] = [
  {
    name: "Asd Apparel",
    handle: "asd-apparel",
    email: "asd@asd.com",
    password: "asd",
    firstName: "Asd",
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
      },
      {
        title: "Vintage Sweatshirt",
        description: "A cozy sweatshirt with a vintage finish.",
        optionValues: ["S", "M", "L"],
        basePrice: 35,
        images: SWEATSHIRT_IMAGES,
      },
    ],
  },
  {
    name: "Zxc Threads",
    handle: "zxc-threads",
    email: "zxc@zxc.com",
    password: "zxc",
    firstName: "Zxc",
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
      },
      {
        title: "Everyday Tee",
        description: "A soft cotton tee for daily wear.",
        optionValues: ["S", "M", "L"],
        basePrice: 18,
        images: TEE_IMAGES,
      },
    ],
  },
]

export default async function seedVendors({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { shippingProfileId, salesChannelId, storeCurrencies } =
    await resolveStorePrerequisites(query)

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

    const { data: existingVendorUsers } = await query.graph({
      entity: "vendor_user",
      fields: ["id"],
      filters: { email: vendorFixture.email },
    })

    if (existingVendorUsers[0]) {
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
      logger.info(
        `Vendor login for "${vendorFixture.name}" — email: ${vendorUser.email}  password: ${vendorUser.password}`,
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
      const location = await createVendorStockLocationWorkflow(
        container,
      ).run({
        input: {
          vendorId,
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
      locationId = location.result.id
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

      const { productOptions, productVariants } = resolveProductVariants(
        options,
        variants,
        storeCurrencies,
      )

      const { result: products } = await createVendorProductWorkflow(
        container,
      ).run({
        input: {
          product: {
            title: productFixture.title,
            description: productFixture.description,
            handle,
            // Real vendor submissions default to PROPOSED, pending staff
            // review — seed products are published outright so they're
            // immediately browsable/purchasable for testing.
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfileId,
            images: productFixture.images.map((url) => ({ url })),
            variants: productVariants,
            sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
          },
          options: productOptions,
          shared: true,
          vendor_id: vendorId,
        },
      })

      for (const variant of products[0]?.variants ?? []) {
        await setVendorInventoryLevelWorkflow(container).run({
          input: {
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
