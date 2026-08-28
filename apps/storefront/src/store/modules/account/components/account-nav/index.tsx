"use client"

import { cn } from "@/lib/utils"
import {
  RiArrowDownSLine,
  RiBox3Line,
  RiLogoutBoxRLine,
  RiMapPinLine,
  RiUserLine,
} from "@remixicon/react"
import { useParams, usePathname } from "next/navigation"

import { signout } from "@/store/lib/data/customer"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { country } = useParams() as { country: string }

  const handleLogout = async () => {
    await signout(country)
  }

  return (
    <div>
      <div className="sm:hidden" data-testid="mobile-account-nav">
        {route !== `/${country}/account` ? (
          <LocalizedClientLink
            href="/account"
            className="flex items-center gap-x-2 py-2 text-sm"
            data-testid="account-main-link"
          >
            <>
              <RiArrowDownSLine className="rotate-90 transform" />
              <span>Account</span>
            </>
          </LocalizedClientLink>
        ) : (
          <>
            <div className="mb-4 px-8 text-xl font-semibold">
              Hello {customer?.first_name}
            </div>
            <div>
              <ul>
                <li>
                  <LocalizedClientLink
                    href="/account/profile"
                    className="flex items-center justify-between border-b px-8 py-4"
                    data-testid="profile-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <RiUserLine size={20} />
                        <span>Profile</span>
                      </div>
                      <RiArrowDownSLine className="-rotate-90 transform" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/addresses"
                    className="flex items-center justify-between border-b px-8 py-4"
                    data-testid="addresses-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <RiMapPinLine size={20} />
                        <span>Addresses</span>
                      </div>
                      <RiArrowDownSLine className="-rotate-90 transform" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/orders"
                    className="flex items-center justify-between border-b px-8 py-4"
                    data-testid="orders-link"
                  >
                    <div className="flex items-center gap-x-2">
                      <RiBox3Line size={20} />
                      <span>Orders</span>
                    </div>
                    <RiArrowDownSLine className="-rotate-90 transform" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between border-b px-8 py-4"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <div className="flex items-center gap-x-2">
                      <RiLogoutBoxRLine size={18} />
                      <span>Log out</span>
                    </div>
                    <RiArrowDownSLine className="-rotate-90 transform" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="hidden sm:block" data-testid="account-nav">
        <div>
          <div className="pb-4">
            <h3 className="font-semibold">Account</h3>
          </div>
          <div>
            <ul className="mb-0 flex flex-col items-start justify-start gap-y-4">
              <li>
                <AccountNavLink
                  href="/account"
                  route={route!}
                  data-testid="overview-link"
                >
                  Overview
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/profile"
                  route={route!}
                  data-testid="profile-link"
                >
                  Profile
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/addresses"
                  route={route!}
                  data-testid="addresses-link"
                >
                  Addresses
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/orders"
                  route={route!}
                  data-testid="orders-link"
                >
                  Orders
                </AccountNavLink>
              </li>
              <li className="text-muted-foreground">
                <button
                  type="button"
                  onClick={handleLogout}
                  data-testid="logout-button"
                >
                  Log out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { country }: { country: string } = useParams()

  const active = route.split(country)[1] === href
  return (
    <LocalizedClientLink
      href={href}
      className={cn("text-muted-foreground hover:text-foreground", {
        "font-semibold text-foreground": active,
      })}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
