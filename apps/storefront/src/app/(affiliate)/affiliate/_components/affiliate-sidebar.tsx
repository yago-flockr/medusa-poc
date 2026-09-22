"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAffiliateAuthStore } from "@/affiliate/stores/auth-store"
import {
  RiBarChartLine,
  RiLogoutCircleLine,
  RiStore2Line,
} from "@remixicon/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ComponentProps } from "react"

const ITEMS = [
  { href: "/affiliate", label: "Sales", icon: RiBarChartLine },
  { href: "/affiliate/products", label: "Products", icon: RiStore2Line },
]

export function AffiliateSidebar(props: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const clearToken = useAffiliateAuthStore((state) => state.clearToken)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Affiliate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ITEMS.map((item) => (
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
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Sign out"
                  onClick={() => {
                    clearToken()
                    router.replace("/affiliate")
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
