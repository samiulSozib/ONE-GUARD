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
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { NotificationPopover } from "./shared/notification-dialog"
import { useRouter } from 'next/navigation'
import { useSidebarToggle } from "@/components/providers/sidebar-toggle-provider"

export function SiteHeader() {
  const router = useRouter()
  const [notificationOpen, setNotificationOpen] = useState(false)
  const { activeSidebar, toggleSidebar } = useSidebarToggle()

  const handleMessagesClick = () => {
    router.push('/messages')
  }

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
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => setNotificationOpen(true)}>
                <NotificationPopover/>
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0" 
                onClick={handleMessagesClick}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">Messages</span>
              </Button>

              <Button variant="ghost" size="sm" className="h-9 gap-1">
                <Power className="h-4 w-4" />
                <span className="sr-only">New</span>
              </Button>

              <Separator
                orientation="vertical"
                className="mx-1 data-[orientation=vertical]:h-4"
              />
            </div>

            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <EllipsisVertical className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">John Doe</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        john.doe@example.com
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* Sidebar Toggle in Mobile Menu */}
                  <DropdownMenuItem 
                    className="flex items-center gap-2" 
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

                  <DropdownMenuItem className="flex items-center gap-2" onClick={() => setNotificationOpen(true)}>
                    <NotificationPopover/>
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2" 
                    onClick={handleMessagesClick}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Item
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <ModeToggle />
          </div>
        </div>
      </header>
    </>
  )
}