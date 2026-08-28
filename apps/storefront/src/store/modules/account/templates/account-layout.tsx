import React from "react"

import UnderlineLink from "@/store/modules/common/components/interactive-link"

import { HttpTypes } from "@medusajs/types"
import AccountNav from "../components/account-nav"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 sm:py-12" data-testid="account-page">
      <div className="mx-auto flex h-full max-w-5xl flex-1 flex-col px-4 sm:px-6">
        <div className="grid grid-cols-1 py-12 sm:grid-cols-[240px_1fr]">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>
        <div className="flex flex-col items-end justify-between gap-8 py-12 sm:flex-row sm:border-t">
          <div>
            <h3 className="mb-4 text-xl font-semibold">Got questions?</h3>
            <span className="text-sm">
              You can find frequently asked questions and answers on our
              customer service page.
            </span>
          </div>
          <div>
            <UnderlineLink href="/customer-service">
              Customer Service
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
