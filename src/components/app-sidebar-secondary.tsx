"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    Briefcase,
    MapPin,
    Clock,
    AlertTriangle,
    CalendarCheck,
    FileArchive,
    BarChart3,
    Settings,
    Shield,
    LogOut,
    GalleryVerticalEnd,
    AudioWaveform,
    Command
} from "lucide-react"
import { ChevronRight } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarSeparator,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TeamSwitcher } from "./team-switcher"
import { NavUser } from "./nav-user"

const largeData = {
    user: {
        name: "John Doe",
        email: "john@securityfirm.com",
        avatar: "/avatars/user.jpg",
        role: "Administrator",
    },
    
    teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
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
            icon: Users,
        },
        {
            title: "Clients",
            url: "/clients",
            icon: Briefcase,
        },
        {
            title: "Sites / Posts",
            url: "/sites",
            icon: MapPin,
        },
        {
            title: "Shifts",
            url: "/shifts",
            icon: Clock,
        },
        {
            title: "Incidents",
            url: "/incidents",
            icon: AlertTriangle,
        },
        {
            title: "Attendance & Payroll",
            url: "/attendance",
            icon: CalendarCheck,
        },
        {
            title: "Invoices & Billing",
            url: "/invoices",
            icon: FileArchive,
        },
        {
            title: "Reports & Analytics",
            url: "/reports",
            icon: BarChart3,
        },
        {
            title: "Settings",
            url: "/settings",
            icon: Settings,
        },
    ],
}

export function AppSidebarSecondary({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const activeItem = pathname

    return (
        <Sidebar
            collapsible="icon"
            {...props}
            className="bg-gradient-to-b from-sidebar to-sidebar/95"
        >
            <SidebarHeader>
                    <TeamSwitcher teams={largeData.teams} />
                  </SidebarHeader>

            <SidebarContent className="px-3">
                <SidebarMenu>
                    {largeData.navMain.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <Link href={item.url} className="block">
                                <SidebarMenuButton
                                    size="lg"
                                    isActive={activeItem === item.url}
                                    className={cn(
                                        "group relative w-full",
                                        activeItem === item.url && "bg-primary/5"
                                    )}
                                >
                                    <div className="relative flex items-center gap-4 w-full px-3 py-2">
                                        {/* Active indicator */}
                                        {activeItem === item.url && (
                                            <ChevronRight className="absolute -left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F0015]" />
                                        )}

                                        {/* Icon container */}
                                        <div
                                            className={cn(
                                                "p-2 rounded-md transition-all duration-200",
                                                activeItem === item.url
                                                    ? "bg-sidebar-accent text-[#5F0015] shadow-sm"
                                                    : "bg-sidebar-accent/40 text-muted-foreground group-hover:bg-sidebar-accent group-hover:text-[#30030c]"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                        </div>

                                        {/* Text */}
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span
                                                className={cn(
                                                    "text-[18px] truncate transition-colors",
                                                    activeItem === item.url
                                                        ? "font-semibold text-[#5F0015]"
                                                        : "font-medium text-muted-foreground group-hover:text-primary"
                                                )}
                                            >
                                                {item.title}
                                            </span>
                                        </div>
                                    </div>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                    <NavUser user={largeData.user} />
                  </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}