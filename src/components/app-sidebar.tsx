"use client"

import * as React from "react"
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


import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

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
    isActive: true,
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
    title: "Complaint",
    url: "/complaint",
    icon: MessageSquareWarning,
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: Phone,
  },
  // {
  //   title: "Notes",
  //   url: "/notes",
  //   icon: StickyNote,
  // },
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
  // {
  //   title: "Settings",
  //   url: "/settings",
  //   icon: Settings,
  // },
  {
    title: "Incident",
    url: "/incident",
    icon: AlertTriangle,
  },
],

  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
