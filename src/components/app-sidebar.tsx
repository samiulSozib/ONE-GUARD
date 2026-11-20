"use client"

import {
  
  MonitorCheck,AlertTriangle,
  AudioWaveform,
  BadgeCheck,
  BarChart3,
  Calendar,
  CalendarCheck,
  ClipboardList,
  Clock,
  FolderKanban,
  Footprints,
  LayoutDashboard,
  LocateIcon,
  MapPin,
  MessageSquareWarning,
  Phone,
  Send,
  Settings,
  Settings2,
  Shield,
  KeyRound,
  UserCheck,
  UserPlus,
  UserRoundX,
  Users,
  Wallet,
  FileSpreadsheet,
  FileText,
} from "lucide-react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { useHasPermission } from "@/hooks/usePermission"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import { cn } from "@/lib/utils"

const data = {
  user: {
    name: "OGS",
  },
}

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  /** If set, user needs any of these permissions to see the item */
  permissions?: string[]
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
        permissions: ["dashboard.view"],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        permissions: ["settings.view", "settings.update"],
      },
      {
        title: "Roles & Permissions",
        url: "/roles-permissions",
        icon: KeyRound,
        permissions: ["rbac.view", "rbac.manage"],
      },
      {
        title: "Attendance Policy",
        url: "/attendance-policy",
        icon: Settings2,
        permissions: ["settings.view", "settings.update", "operations.manage"],
      },
    ],
  },

  {
    label: "HR Management",
    items: [
      {
        title: "Security Officers",
        url: "/guards",
        icon: Shield,
        permissions: ["guards.view", "guards.manage"],
      },
      {
        title: "Client Accounts",
        url: "/clients",
        icon: Users,
        permissions: ["clients.view", "clients.manage"],
      },
      {
        title: "Account Deletion Requests",
        url: "/account-deletion-requests",
        icon: UserRoundX,
        permissions: ["clients.manage", "users.manage"],
      },
      {
        title: "Client Contracts",
        url: "/client-contracts",
        icon: MessageSquareWarning,
        permissions: ["contracts.view", "contracts.manage"],
      },
      {
        title: "Client Contract Services",
        url: "/client-contract-services",
        icon: MessageSquareWarning,
        permissions: ["contracts.view", "contracts.manage"],
      },
      {
        title: "Contract Services Components",
        url: "/client-contract-service-components",
        icon: MessageSquareWarning,
        permissions: ["contracts.view", "contracts.manage"],
      },
      {
        title: "Time Off",
        url: "/leave",
        icon: CalendarCheck,
        permissions: ["operations.view", "guards.view"],
      },
      {
        title: "Officers Classification",
        url: "/guard-type",
        icon: BadgeCheck,
        permissions: ["guards.manage"],
      },
      {
        title: "Officers Assignment",
        url: "/guard-assignment",
        icon: UserPlus,
        permissions: ["operations.view", "operations.manage"],
      },
      {
        title: "Assignment Plans",
        url: "/assignment-plans",
        icon: Calendar,
        permissions: ["operations.view", "operations.manage"],
      },
      {
        title: "Contacts",
        url: "/contacts",
        icon: Phone,
        permissions: ["clients.view"],
      },
      {
        title: "Location Tracking",
        url: "/location-tracking",
        icon: LocateIcon,
        permissions: ["operations.live_tracking"],
      },
    ],
  },

  {
    label: "Operations",
    items: [
      {
        title: "Guard Live Map",
        url: "/guard-live-map",
        icon: MapPin,
        permissions: ["operations.live_tracking"],
      },
      {
        title: "Shift Operations",
        url: "/shift-operations",
        icon: MonitorCheck,
        permissions: ["operations.view", "operations.manage"],
      },
      {
        title: "Shift List",
        url: "/duty",
        icon: ClipboardList,
        permissions: ["operations.view", "operations.manage"],
      },
      {
        title: "Shift Schedules",
        url: "/duty-schedules",
        icon: AudioWaveform,
        permissions: ["operations.view", "operations.manage"],
      },
      {
        title: "Scheduling Settings",
        url: "/scheduling-settings",
        icon: Settings,
        permissions: ["operations.manage", "settings.update"],
      },
      {
        title: "Shift Type",
        url: "/duty-time-type",
        icon: Clock,
        permissions: ["operations.manage"],
      },
      {
        title: "Time & Attendance",
        url: "/duty-attendance",
        icon: UserCheck,
        permissions: ["operations.view"],
      },
      {
        title: "Timesheet",
        url: "/timesheet",
        icon: FileSpreadsheet,
        permissions: ["timesheets.view"],
      },
      {
        title: "Patrol Visits",
        url: "/patrol-visits",
        icon: Footprints,
        permissions: ["operations.view"],
      },
      {
        title: "Shift Status Reports",
        url: "/duty-status-report",
        icon: BarChart3,
        permissions: ["operations.view"],
      },
      {
        title: "Shift Logs",
        url: "/shift-logs",
        icon: BarChart3,
        permissions: ["operations.view"],
      },
      {
        title: "Telegram Management",
        url: "/telegram",
        icon: Send,
        permissions: ["telegram.manage"],
      },
    ],
  },

  {
    label: "Finance",
    items: [
      {
        title: "Invoices",
        url: "/invoices",
        icon: FileText,
        permissions: ["invoices.view"],
      },
      {
        title: "Expense Categories",
        url: "/expense-category",
        icon: FolderKanban,
        permissions: ["expenses.manage", "expenses.view"],
      },
      {
        title: "Expenses",
        url: "/expense",
        icon: Wallet,
        permissions: ["expenses.view", "expenses.manage"],
      },
      {
        title: "Expense Approvals",
        url: "/expense-review",
        icon: Wallet,
        permissions: ["expenses.approve"],
      },
    ],
  },

  {
    label: "Reports & Issues",
    items: [
      {
        title: "Client Concerns",
        url: "/complaint",
        icon: MessageSquareWarning,
        permissions: ["operations.view", "clients.view"],
      },
      {
        title: "Incidents",
        url: "/incident",
        icon: AlertTriangle,
        permissions: ["operations.view"],
      },
      {
        title: "Shift Instruction",
        url: "/shift-instruction",
        icon: AlertTriangle,
        permissions: ["operations.view", "operations.manage"],
      },
    ],
  },

  {
    label: "Jobs",
    items: [
      {
        title: "Job Categories",
        url: "/job-categories",
        icon: MessageSquareWarning,
        permissions: ["jobs.view", "jobs.manage"],
      },
      {
        title: "Jobs",
        url: "/jobs",
        icon: AlertTriangle,
        permissions: ["jobs.view", "jobs.manage"],
      },
      {
        title: "Job Applications",
        url: "/job-applications",
        icon: AlertTriangle,
        permissions: ["jobs.view", "jobs.manage"],
      },
    ],
  },

  {
    label: "Email Templates",
    items: [
      {
        title: "Email Templates",
        url: "/email-template-settings",
        icon: MessageSquareWarning,
        permissions: ["email_templates.manage"],
      },
      {
        title: "Email Logs",
        url: "/email-logs",
        icon: MessageSquareWarning,
        permissions: ["email_templates.manage"],
      },
    ],
  },

  {
    label: "Company Service",
    items: [
      {
        title: "Service Category",
        url: "/company-service-categories",
        icon: MessageSquareWarning,
        permissions: ["company_services.manage"],
      },
      {
        title: "Service Unit Types",
        url: "/company-service-unit-types",
        icon: MessageSquareWarning,
        permissions: ["company_services.manage"],
      },
      {
        title: "Billing Methods",
        url: "/company-service-billing-method",
        icon: MessageSquareWarning,
        permissions: ["company_services.manage"],
      },
      {
        title: "Company Service",
        url: "/company-service",
        icon: MessageSquareWarning,
        permissions: ["company_services.manage"],
      },
      {
        title: "Service Component",
        url: "/company-service-component",
        icon: MessageSquareWarning,
        permissions: ["company_services.manage"],
      },
    ],
  },
]

function NavItemLink({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string
}) {
  const allowed = useHasPermission(item.permissions)
  if (!allowed) return null

  const isActive = pathname === item.url

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          "group/btn h-8 rounded-md px-2 text-[13px] transition-colors duration-100",
          "text-black hover:bg-red-800/60 hover:text-zinc-100",
          isActive && "bg-red-800 text-white hover:bg-red-800"
        )}
      >
        <Link href={item.url} className="flex items-center gap-2.5">
          <item.icon
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              isActive
                ? "text-white"
                : "text-red-500 group-hover/btn:text-zinc-300"
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
}

function NavGroupBlock({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  // Render group; individual items hide themselves via permission checks.
  return (
    <SidebarGroup className="mb-3 px-0">
      <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-medium uppercase tracking-widest text-black group-data-[collapsible=icon]:hidden">
        {group.label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-px">
          {group.items.map((item) => (
            <NavItemLink key={item.title} item={item} pathname={pathname} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
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
      <SidebarHeader className="h-14 justify-center border-b border-white/[0.06] px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white">
            <Shield
              className="h-3.5 w-3.5 text-black"
              strokeWidth={2.5}
            />
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

      <SidebarContent className="px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navGroups.map((group) => (
          <NavGroupBlock
            key={group.label}
            group={group}
            pathname={pathname}
          />
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/[0.06] p-2" />

      <SidebarRail />
    </Sidebar>
  )
}