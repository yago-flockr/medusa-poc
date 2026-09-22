import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import type { LinkDefinition, MedusaContainer } from "@medusajs/framework/types"
import { graph } from "../../../lib/query"
import { STOREFRONT_CONTENT_MODULE } from "../../../modules/storefront-content"
import StorefrontContentModuleService from "../../../modules/storefront-content/service"
import type { QueryEntity } from "../../../lib/query"

const STOREFRONT_CONTENT_UPDATABLE_FIELDS = [
  "name",
  "description",
  "hero_image_url",
] as const

type StorefrontContentUpdatableField =
  (typeof STOREFRONT_CONTENT_UPDATABLE_FIELDS)[number]

export type UpsertStorefrontContentInput = {
  linkModuleKey: string
  linkIdField: string
  queryEntity: QueryEntity
  entityId: string
  name?: string
  description?: string
  hero_image_url?: string
}

export type UpsertStorefrontContentOutput = {
  name: string | null
  description: string | null
  hero_image_url: string | null
}

type StorefrontContentUpdateInput = { id: string } & Partial<
  Record<StorefrontContentUpdatableField, string | null>
>

export type UpdatedStorefrontContentCompensation = {
  kind: "updated"
} & StorefrontContentUpdateInput

export type CreatedStorefrontContentCompensation = {
  kind: "created"
  id: string
  link: LinkDefinition
}

export type StorefrontContentCompensation =
  | UpdatedStorefrontContentCompensation
  | CreatedStorefrontContentCompensation

export async function upsertStorefrontContent(
  container: MedusaContainer,
  input: UpsertStorefrontContentInput,
): Promise<{
  output: UpsertStorefrontContentOutput
  compensation: StorefrontContentCompensation
}> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const storefrontContentService: StorefrontContentModuleService =
    container.resolve(STOREFRONT_CONTENT_MODULE)

  const {
    data: [entity],
  } = await graph(query, {
    entity: input.queryEntity,
    filters: { id: input.entityId },
    fields: [
      "id",
      "storefront_content.id",
      "storefront_content.name",
      "storefront_content.description",
      "storefront_content.hero_image_url",
    ],
  })

  if (!entity) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `No ${input.queryEntity} found with id ${input.entityId}`,
    )
  }

  const existing = entity.storefront_content as
    | {
        id: string
        name: string | null
        description: string | null
        hero_image_url: string | null
      }
    | null
    | undefined

  if (existing) {
    const update: StorefrontContentUpdateInput = { id: existing.id }
    const compensation: UpdatedStorefrontContentCompensation = {
      kind: "updated",
      id: existing.id,
    }

    for (const field of STOREFRONT_CONTENT_UPDATABLE_FIELDS) {
      if (input[field] !== undefined) {
        compensation[field] = existing[field]
        update[field] = input[field]
      }
    }

    const [content] = await storefrontContentService.updateStorefrontContents([
      update,
    ])

    return {
      output: {
        name: content.name,
        description: content.description,
        hero_image_url: content.hero_image_url,
      },
      compensation,
    }
  }

  const [created] = await storefrontContentService.createStorefrontContents([
    {
      name: input.name ?? null,
      description: input.description ?? null,
      hero_image_url: input.hero_image_url ?? null,
    },
  ])

  const linkDefinition: LinkDefinition = {
    [input.linkModuleKey]: { [input.linkIdField]: input.entityId },
    [STOREFRONT_CONTENT_MODULE]: { storefront_content_id: created.id },
  }

  await link.create(linkDefinition)

  return {
    output: {
      name: created.name,
      description: created.description,
      hero_image_url: created.hero_image_url,
    },
    compensation: { kind: "created", id: created.id, link: linkDefinition },
  }
}

export async function compensateStorefrontContent(
  container: MedusaContainer,
  compensation: StorefrontContentCompensation | undefined,
): Promise<void> {
  if (!compensation) {
    return
  }

  const storefrontContentService: StorefrontContentModuleService =
    container.resolve(STOREFRONT_CONTENT_MODULE)

  if (compensation.kind === "updated") {
    const update: StorefrontContentUpdateInput = { id: compensation.id }

    for (const field of STOREFRONT_CONTENT_UPDATABLE_FIELDS) {
      if (field in compensation) {
        update[field] = compensation[field]
      }
    }

    await storefrontContentService.updateStorefrontContents([update])
    return
  }

  const link = container.resolve(ContainerRegistrationKeys.LINK)
  await link.dismiss(compensation.link)
  await storefrontContentService.deleteStorefrontContents(compensation.id)
}

export const upsertStorefrontContentStep = createStep(
  "upsert-storefront-content",
  async (
    input: UpsertStorefrontContentInput,
    { container },
  ): Promise<
    StepResponse<UpsertStorefrontContentOutput, StorefrontContentCompensation>
  > => {
    const { output, compensation } = await upsertStorefrontContent(
      container,
      input,
    )
    return new StepResponse(output, compensation)
  },
  async (
    compensation: StorefrontContentCompensation | undefined,
    { container },
  ) => {
    await compensateStorefrontContent(container, compensation)
  },
)
