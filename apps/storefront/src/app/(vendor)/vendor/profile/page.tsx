"use client"

import { useFindOneVendor } from "@/vendor/hooks/queries/vendor"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export default function VendorProfilePage() {
  const { data, isLoading } = useFindOneVendor()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <ProfileRow label="Vendor name" value={data.vendor.name} />
            <ProfileRow label="Handle" value={data.vendor.handle} />
            <Separator className="my-2" />
            <ProfileRow
              label="Your name"
              value={
                [data.vendor_user.first_name, data.vendor_user.last_name]
                  .filter(Boolean)
                  .join(" ") || "—"
              }
            />
            <ProfileRow label="Email" value={data.vendor_user.email} />
            <Separator className="my-2" />
            <ProfileRow
              label="Shopify connection"
              value={
                data.vendor.shopify_connected
                  ? (data.vendor.shopify_store_domain ?? "Connected")
                  : "Not connected"
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
