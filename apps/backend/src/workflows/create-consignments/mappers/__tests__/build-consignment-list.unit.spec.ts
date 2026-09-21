import { describe, expect, it } from "@jest/globals"
import { buildConsignmentList } from "../build-consignment-list"

describe("buildConsignmentList", () => {
  it("returns nothing for an order with no consignment links", () => {
    expect(buildConsignmentList([])).toEqual([])
  })

  it("summarises a consignment with its vendor", () => {
    expect(
      buildConsignmentList([
        {
          consignment: {
            id: "con_1",
            status: "placed",
            vendor: { id: "vendor_1" },
          },
        },
      ]),
    ).toEqual([{ id: "con_1", status: "placed", vendor_id: "vendor_1" }])
  })

  it("returns one summary per vendor on a split order", () => {
    const summaries = buildConsignmentList([
      {
        consignment: {
          id: "con_1",
          status: "placed",
          vendor: { id: "vendor_1" },
        },
      },
      {
        consignment: {
          id: "con_2",
          status: "accepted",
          vendor: { id: "vendor_2" },
        },
      },
    ])

    expect(summaries.map((summary) => summary.vendor_id)).toEqual([
      "vendor_1",
      "vendor_2",
    ])
  })

  it("skips a link whose consignment was not resolved", () => {
    expect(
      buildConsignmentList([
        { consignment: null },
        {
          consignment: {
            id: "con_1",
            status: "placed",
            vendor: { id: "vendor_1" },
          },
        },
      ]),
    ).toHaveLength(1)
  })

  it("keeps a consignment whose vendor link is missing", () => {
    expect(
      buildConsignmentList([
        { consignment: { id: "con_1", status: "placed", vendor: null } },
      ]),
    ).toEqual([{ id: "con_1", status: "placed", vendor_id: undefined }])
  })
})
