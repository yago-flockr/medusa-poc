export type ConsignmentOrderLink = {
  consignment?: {
    id: string
    status: string
    vendor?: { id?: string | null } | null
  } | null
}

export type ConsignmentSummary = {
  id: string
  status: string
  vendor_id: string | undefined
}

export function buildConsignmentList(
  links: ConsignmentOrderLink[],
): ConsignmentSummary[] {
  return links
    .map((link) => link.consignment)
    .filter(
      (consignment): consignment is NonNullable<typeof consignment> =>
        consignment != null,
    )
    .map((consignment) => ({
      id: consignment.id,
      status: consignment.status,
      vendor_id: consignment.vendor?.id ?? undefined,
    }))
}
