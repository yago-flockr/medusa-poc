"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useVendorAuthStore } from "@/vendor/stores/auth-store"
import {
  RiBuilding2Line,
  RiDashboardLine,
  RiLogoutCircleLine,
  RiMapPinLine,
  RiShoppingBag3Line,
  RiStore2Line,
  RiUserLine,
} from "@remixicon/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

const STORE_ITEMS = [
  { href: "/vendor", label: "Dashboard", icon: RiDashboardLine },
  { href: "/vendor/orders", label: "Orders", icon: RiShoppingBag3Line },
  { href: "/vendor/products", label: "Products", icon: RiStore2Line },
  { href: "/vendor/locations", label: "Locations", icon: RiMapPinLine },
]

const CONNECTION_ITEMS = [
  { href: "/vendor/shopify", label: "Shopify", icon: RiBuilding2Line },
]

const ACCOUNT_ITEMS = [
  { href: "/vendor/profile", label: "Profile", icon: RiUserLine },
]

export function VendorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const clearToken = useVendorAuthStore((state) => state.clearToken)

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Store</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {STORE_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Connections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CONNECTION_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarContent className="justify-end">
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ACCOUNT_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Sign out"
                  onClick={() => {
                    clearToken()
                    router.replace("/vendor")
                  }}
                >
                  <RiLogoutCircleLine />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
