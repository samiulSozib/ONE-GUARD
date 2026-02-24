"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./ui/mode-toggle"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group"
import { Search, Bell, MessageSquare, Plus, Menu, User, Settings, LogOut, EllipsisVertical, Power, PanelLeft, PanelRight, SwitchCamera } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { NotificationPopover } from "./shared/notification-dialog"
import { useRouter } from 'next/navigation'
import { useSidebarToggle } from "@/components/providers/sidebar-toggle-provider"
import { logout } from "@/store/slices/authSlice"
import SweetAlertService from "@/lib/sweetAlert"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"

export function SiteHeader() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const { activeSidebar, toggleSidebar } = useSidebarToggle()
  const [isClient, setIsClient] = useState(false)

  // Mark when component is mounted on client
  useEffect(() => {
    //setIsClient(true)
  }, [])

  const handleMessagesClick = () => {
    router.push('/messages')
  }

  const handleLogout = async () => {
    try {
      // Show confirmation dialog before logout
      const result = await SweetAlertService.confirm(
        'Logout Confirmation',
        'Are you sure you want to logout?',
        'Yes, Logout',
        'Cancel'
      )
      
      if (result.isConfirmed) {
        await dispatch(logout())
        // Redirect to login page after successful logout
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      SweetAlertService.error(
        'Logout Failed',
        'There was an error logging out. Please try again.'
      )
    }
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  const handleSettingsClick = () => {
    router.push('/settings')
  }

  // Get user initials - only on client side
  const getUserInitials = () => {
    if (!user?.first_name) return null
    const firstInitial = user.first_name.charAt(0).toUpperCase()
    const lastInitial = user.last_name?.charAt(0).toUpperCase() || ''
    return `${firstInitial}${lastInitial}`
  }

  const userInitials = getUserInitials()

  return (
    <>
      <header className="border-1 mt-2 mx-6 rounded-md flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />

          <InputGroup className="w-full lg:max-w-[300px]">
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon>
              <Search className="h-4 w-4" />
            </InputGroupAddon>
          </InputGroup>

          <div className="ml-auto flex items-center gap-2">
            {/* Sidebar Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-9 gap-1 hidden sm:flex"
              title={`Switch to ${activeSidebar === "main" ? "Secondary" : "Main"} Sidebar`}
            >
              {activeSidebar === "main" ? (
                <>
                  <PanelRight className="h-4 w-4" />
                  <span className="hidden lg:inline">Secondary</span>
                </>
              ) : (
                <>
                  <PanelLeft className="h-4 w-4" />
                  <span className="hidden lg:inline">Main</span>
                </>
              )}
            </Button>

            <div className="hidden sm:flex items-center gap-1">
              {/* <NotificationPopover/> */}

              {/* <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0" 
                onClick={handleMessagesClick}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">Messages</span>
              </Button>

              <Button variant="ghost" size="sm" className="h-9 gap-1">
                <Plus className="h-4 w-4" />
                <span className="sr-only">New</span>
              </Button> */}

              <Separator
                orientation="vertical"
                className="mx-1 data-[orientation=vertical]:h-4"
              />
            </div>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    {/* Always show User icon during SSR, switch to initials only on client */}
                    {!isClient || !userInitials ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">
                        {userInitials}
                      </span>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {user?.first_name ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground capitalize">
                          Role: {user?.role?.replace('_', ' ')}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Loading...
                      </p>
                    </div>
                  </DropdownMenuLabel>
                )}
                
                <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                {/* Sidebar Toggle in Dropdown */}
                <DropdownMenuItem 
                  onClick={toggleSidebar} 
                  className="cursor-pointer"
                >
                  {activeSidebar === "main" ? (
                    <>
                      <PanelRight className="mr-2 h-4 w-4" />
                      Switch to Secondary Sidebar
                    </>
                  ) : (
                    <>
                      <PanelLeft className="mr-2 h-4 w-4" />
                      Switch to Main Sidebar
                    </>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <EllipsisVertical className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center justify-start gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        {!isClient || !userInitials ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <span className="text-xs font-medium">
                            {userInitials}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {user?.first_name ? `${user.first_name} ${user.last_name}` : 'Loading...'}
                        </p>
                        <p className="w-[200px] truncate text-xs text-muted-foreground">
                          {user?.email || 'Loading...'}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Sidebar Toggle in Mobile Menu */}
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer" 
                    onClick={toggleSidebar}
                  >
                    {activeSidebar === "main" ? (
                      <>
                        <PanelRight className="h-4 w-4" />
                        Switch to Secondary
                      </>
                    ) : (
                      <>
                        <PanelLeft className="h-4 w-4" />
                        Switch to Main
                      </>
                    )}
                  </DropdownMenuItem>

                  {/* <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer" 
                    onClick={() => setNotificationOpen(true)}
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer" 
                    onClick={handleMessagesClick}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </DropdownMenuItem> */}
                  
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleProfileClick}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleSettingsClick}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* <ModeToggle /> */}
          </div>
        </div>
      </header>
    </>
  )
}