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
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  Dot,
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
import { TeamSwitcher } from "./team-switcher"
import { NavUser } from "./nav-user"

const data = {
  user: {
    name: "John Doe",
    email: "john@securityfirm.com",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    { name: "OGS Security", logo: GalleryVerticalEnd, plan: "Enterprise" },

  ],
}

const navGroups = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Workforce",
    items: [
      { title: "Security Officers", url: "/guards", icon: Shield },
      { title: "Client Accounts", url: "/clients", icon: Users },
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
    label: "Issues",
    items: [
      { title: "Client Contracts", url: "/client-contracts", icon: MessageSquareWarning },

      { title: "Client Concerns", url: "/complaint", icon: MessageSquareWarning },
      { title: "Incidents", url: "/incident", icon: AlertTriangle },
    ],
  },
]

export function AppSidebarSecondary({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-zinc-200/80"
      style={
        {
          "--sidebar-background": "#ffffff",
          "--sidebar-foreground": "#3f3f46",
          "--sidebar-border": "#e4e4e7",
          "--sidebar-accent": "#f4f4f5",
          "--sidebar-accent-foreground": "#18181b",
          "--sidebar-primary": "#18181b",
          "--sidebar-primary-foreground": "#ffffff",
          "--sidebar-ring": "#18181b",
        } as React.CSSProperties
      }
      {...props}
    >
      {/* ── Header ── */}
      <SidebarHeader className="border-b border-zinc-100 px-3 py-3">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent className="px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navGroups.map((group, gi) => (
          <SidebarGroup key={group.label} className={cn("px-0", gi > 0 && "mt-4")}>
            {/* Group label with left rule */}
            <div className="mb-1 flex items-center gap-2 px-2 group-data-[collapsible=icon]:hidden">
              <span className="h-px flex-1 bg-zinc-100" />
              <SidebarGroupLabel className="px-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                {group.label}
              </SidebarGroupLabel>
              <span className="h-px flex-1 bg-zinc-100" />
            </div>

            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
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
                          "group/btn relative h-8 rounded-md px-2.5 text-[13px] font-medium transition-all duration-100",
                          !isActive && "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800",
                          isActive && "bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white",
                        )}
                      >
                        <Link href={item.url} className="flex items-center gap-2.5">
                          <item.icon
                            className={cn(
                              "h-[14px] w-[14px] shrink-0",
                              isActive ? "text-white" : "text-zinc-400 group-hover/btn:text-zinc-600",
                            )}
                            strokeWidth={isActive ? 2.2 : 1.8}
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
      <SidebarFooter className="border-t border-zinc-100 p-2">
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}