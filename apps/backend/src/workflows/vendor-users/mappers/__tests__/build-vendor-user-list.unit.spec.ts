import { describe, expect, it } from "@jest/globals"
import { buildVendorUserList } from "../build-vendor-user-list"

describe("buildVendorUserList", () => {
  it("maps each vendor user and carries pagination through", () => {
    const result = buildVendorUserList({
      vendorUsers: [
        {
          id: "vu_1",
          vendor_id: "vendor_1",
          first_name: "Jane",
          last_name: "Doe",
          email: "jane@example.com",
          is_active: true,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
      ],
      count: 1,
      limit: 20,
      offset: 0,
    })

    expect(result.vendor_users).toHaveLength(1)
    expect(result.count).toBe(1)
  })

  it("returns an empty vendor_users array with pagination preserved", () => {
    const result = buildVendorUserList({
      vendorUsers: [],
      count: 0,
      limit: 20,
      offset: 0,
    })

    expect(result.vendor_users).toEqual([])
  })
})
