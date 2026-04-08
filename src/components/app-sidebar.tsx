"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Shield,
  Users,
  UserCheck,
  Wallet,
  FolderKanban,
  MessageSquareWarning,
  Phone,
  BadgeCheck,
  ClipboardList,
  Clock,
  UserPlus,
  CalendarCheck,
  BarChart3,
  AlertTriangle,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "HR Management",
    items: [
      { title: "Security Officers", url: "/guards", icon: Shield },
      { title: "Client Accounts", url: "/clients", icon: Users },
      { title: "Client Contracts", url: "/client-contracts", icon: MessageSquareWarning },

      { title: "Time Off", url: "/leave", icon: CalendarCheck },
      { title: "Officers Classification", url: "/guard-type", icon: BadgeCheck },
      { title: "Officers Assignment", url: "/guard-assignment", icon: UserPlus },
      { title: "Contacts", url: "/contacts", icon: Phone },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Shift List", url: "/duty", icon: ClipboardList },
      { title: "Shift Type", url: "/duty-time-type", icon: Clock },
      { title: "Time & Attendance", url: "/duty-attendance", icon: UserCheck },
      { title: "Shift Status Reports", url: "/duty-status-report", icon: BarChart3 },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Expense Categories", url: "/expense-category", icon: FolderKanban },
      { title: "Expenses", url: "/expense", icon: Wallet },
      { title: "Expense Approvals", url: "/expense-review", icon: Wallet },
    ],
  },
  {
    label: "Reports & Issues",
    items: [
      { title: "Client Concerns", url: "/complaint", icon: MessageSquareWarning },
      { title: "Incidents", url: "/incident", icon: AlertTriangle },
      { title: "Shift Instruction", url: "/shift-instruction", icon: AlertTriangle },

    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/[0.06]"
      style={
        {
          "--sidebar-background": "#09090b",
          "--sidebar-foreground": "#71717a",
          "--sidebar-border": "rgba(255,255,255,0.06)",
          "--sidebar-accent": "#18181b",
          "--sidebar-accent-foreground": "#fafafa",
          "--sidebar-primary": "#ffffff",
          "--sidebar-primary-foreground": "#09090b",
          "--sidebar-ring": "#ffffff",
        } as React.CSSProperties
      }
      {...props}
    >
      {/* ── Header ── */}
      <SidebarHeader className="h-14 justify-center border-b border-white/[0.06] px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white">
            <Shield className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-[13px] font-semibold text-black">
              OGS Security
            </span>
            <span className="truncate text-[10px] text-zinc-500">
              Enterprise Plan
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent className="px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="mb-3 px-0">
            <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600 group-data-[collapsible=icon]:hidden">
              {group.label}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-px">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (item.url !== "/" && pathname?.startsWith(item.url))

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "group/btn h-8 rounded-md px-2 text-[13px] transition-colors duration-100",
                          "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100",
                          isActive && "bg-zinc-800 text-white hover:bg-zinc-800",
                        )}
                      >
                        <Link href={item.url} className="flex items-center gap-2.5">
                          <item.icon
                            className={cn(
                              "h-3.5 w-3.5 shrink-0",
                              isActive
                                ? "text-white"
                                : "text-zinc-500 group-hover/btn:text-zinc-300",
                            )}
                            strokeWidth={isActive ? 2.5 : 1.8}
                          />
                          <span className="truncate group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="border-t border-white/[0.06] p-2">
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}