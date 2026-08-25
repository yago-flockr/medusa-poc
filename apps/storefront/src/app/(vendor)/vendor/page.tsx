"use client"

import { useFindOneVendor } from "@/vendor/hooks/queries/vendor"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function VendorDashboardPage() {
  const { data, isLoading } = useFindOneVendor()

  return (
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
  )
}
