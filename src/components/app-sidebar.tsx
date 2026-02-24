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
  StickyNote,
  BadgeCheck,
  ClipboardList,
  Clock,
  UserPlus,
  CalendarCheck,
  BarChart3,
  Settings,
  AlertTriangle,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  Frame,
  PieChart,
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
import { TeamSwitcher } from "@/components/team-switcher"
import { NavUser } from "@/components/nav-user"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "OGS",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Guards / Employees",
      url: "/guards",
      icon: Shield,
    },
    {
      title: "Clients",
      url: "/clients",
      icon: Users,
    },
    {
      title: "Leave",
      url: "/leave",
      icon: CalendarCheck,
    },
    {
      title: "Expense Category",
      url: "/expense-category",
      icon: FolderKanban,
    },
    {
      title: "Expense",
      url: "/expense",
      icon: Wallet,
    },
    {
      title: "Expense Review",
      url: "/expense-review",
      icon: Wallet,
    },
    {
      title: "Complaint",
      url: "/complaint",
      icon: MessageSquareWarning,
    },
    {
      title: "Contacts",
      url: "/contacts",
      icon: Phone,
    },
    {
      title: "Guard Type",
      url: "/guard-type",
      icon: BadgeCheck,
    },
    {
      title: "Duty List",
      url: "/duty",
      icon: ClipboardList,
    },
    {
      title: "Duty Time Type",
      url: "/duty-time-type",
      icon: Clock,
    },
    {
      title: "Guard Assignment",
      url: "/guard-assignment",
      icon: UserPlus,
    },
    {
      title: "Duty Attendance",
      url: "/duty-attendance",
      icon: UserCheck,
    },
    {
      title: "Duty Status Report",
      url: "/duty-status-report",
      icon: BarChart3,
    },
    {
      title: "Incident",
      url: "/incident",
      icon: AlertTriangle,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => {
                const isActive = pathname === item.url || 
                                 (item.url !== '/' && pathname?.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}