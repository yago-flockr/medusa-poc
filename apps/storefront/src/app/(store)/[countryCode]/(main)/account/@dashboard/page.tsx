import { Metadata } from "next"

import { retrieveCustomer } from "@/store/lib/data/customer"
import { listOrders } from "@/store/lib/data/orders"
import Overview from "@/store/modules/account/components/overview"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer().catch(() => null)
  const orders = (await listOrders().catch(() => null)) || null

  if (!customer) {
    notFound()
  }

  return <Overview customer={customer} orders={orders} />
}
