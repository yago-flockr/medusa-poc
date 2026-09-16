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

const NAV_ITEMS = [
  { href: "/vendor", label: "Dashboard", icon: RiDashboardLine },
  { href: "/vendor/orders", label: "Orders", icon: RiShoppingBag3Line },
  { href: "/vendor/products", label: "Products", icon: RiStore2Line },
  { href: "/vendor/locations", label: "Locations", icon: RiMapPinLine },
  { href: "/vendor/shopify", label: "Shopify", icon: RiBuilding2Line },
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
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={() => {
                clearToken()
                router.replace("/vendor")
              }}
            >
              <RiLogoutCircleLine />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
