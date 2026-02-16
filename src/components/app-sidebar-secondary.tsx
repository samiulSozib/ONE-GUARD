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
    Command,
    Frame,
    PieChart,
    Wallet,
    FolderKanban,
    MessageSquareWarning,
    Phone,
    StickyNote,
    BadgeCheck,
    ClipboardList,
    UserPlus,
    UserCheck,
    AlertTriangle as AlertTriangleIcon,
    ChevronRight,
} from "lucide-react"

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
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { TeamSwitcher } from "./team-switcher"
import { NavUser } from "./nav-user"

// This is sample data matching AppSidebar structure
const data = {
    user: {
        name: "John Doe",
        email: "john@securityfirm.com",
        avatar: "/avatars/user.jpg",
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
        {
            title: "Notes",
            url: "/notes",
            icon: StickyNote,
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
            title: "Settings",
            url: "/settings",
            icon: Settings,
        },
        {
            title: "Incident",
            url: "/incident",
            icon: AlertTriangleIcon,
        },
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: Frame,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Travel",
            url: "#",
            icon: MapPin,
        },
    ],
}

export function AppSidebarSecondary({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="pb-4">
                <div className="px-3 py-2">
                    <TeamSwitcher teams={data.teams} />
                </div>
                {/* Optional subtle divider */}
                <div className="px-3">
                    <div className="h-px bg-sidebar-border/40"></div>
                </div>
            </SidebarHeader>

            <SidebarContent className="gap-6">
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel className="px-4 text-xs font-medium tracking-wider text-sidebar-foreground/60 uppercase">
                        Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1 px-2">
                            {data.navMain.map((item) => {
                                const isActive = pathname === item.url || 
                                               (item.url !== '/' && pathname?.startsWith(item.url));
                                
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                            size="lg"
                                            className={cn(
                                                "group relative w-full py-2.5 transition-all duration-200",
                                                isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm",
                                                !isActive && "hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                            )}
                                        >
                                            <Link href={item.url} className="flex items-center gap-3">
                                                <item.icon className={cn(
                                                    "h-4 w-4 shrink-0 transition-transform",
                                                    isActive && "scale-105"
                                                )} />
                                                <span className="text-sm tracking-wide">{item.title}</span>
                                                
                                                {/* Subtle active indicator */}
                                                {isActive && (
                                                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-sidebar-foreground/50" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="mx-3 bg-sidebar-border/30" />

                {/* Projects Section */}
                <SidebarGroup>
                    <SidebarGroupLabel className="px-4 text-xs font-medium tracking-wider text-sidebar-foreground/60 uppercase">
                        Projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1 px-2">
                            {data.projects.map((project) => (
                                <SidebarMenuItem key={project.name}>
                                    <SidebarMenuButton 
                                        asChild 
                                        tooltip={project.name}
                                        size="lg"
                                        className="py-2 hover:bg-sidebar-accent/50 transition-colors"
                                    >
                                        <Link href={project.url} className="flex items-center gap-3">
                                            <project.icon className="h-4 w-4 shrink-0 text-sidebar-foreground/70" />
                                            <span className="text-sm tracking-wide">{project.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Optional spacer */}
                <div className="flex-1"></div>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/30 pt-2">
                <div className="px-3 py-2">
                    <NavUser user={data.user} />
                </div>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}