"use client"

import { useRequireVendorAuth } from "@/vendor/hooks/custom/use-require-vendor-auth"
import { useFindOneVendor } from "@/vendor/hooks/queries/vendor"
import { VendorNav } from "@/vendor/components/nav"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function VendorDashboardPage() {
  const checked = useRequireVendorAuth()
  const { data, isLoading } = useFindOneVendor(undefined, {
    enabled: checked,
  })

  if (!checked) {
    return null
  }

  return (
    <div>
      <VendorNav />
      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? "Loading…" : `Welcome, ${data?.vendor.name ?? ""}`}
          </CardTitle>
          <CardDescription>
            This is your vendor dashboard. See your profile and orders in the
            navigation above.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
