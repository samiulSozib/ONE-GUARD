// components/notification-popover.tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bell, X, CheckCircle2, AlertCircle, Info, Settings } from "lucide-react"
import { ScrollArea } from "../ui/scroll-area"

export function NotificationPopover() {
  const notifications = [
    {
      id: 1,
      title: "New message received",
      description: "You have a new message from John Doe",
      time: "5 min ago",
      type: "info",
      read: false
    },
    {
      id: 2,
      title: "Meeting reminder",
      description: "Team meeting starts in 30 minutes",
      time: "1 hour ago",
      type: "warning",
      read: false
    },
    {
      id: 3,
      title: "Task completed",
      description: "Your project 'Q4 Report' has been completed",
      time: "2 hours ago",
      type: "success",
      read: true
    },
    {
      id: 4,
      title: "System update",
      description: "System maintenance scheduled for tonight",
      time: "1 day ago",
      type: "info",
      read: true
    },
    {
      id: 5,
      title: "New assignment",
      description: "You have been assigned to a new project",
      time: "2 days ago",
      type: "info",
      read: true
    }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex flex-col">
          

          {/* Notifications List */}
          <ScrollArea className="h-80">
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
                    !notification.read ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.time}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-2">
            <Button variant="ghost" className="w-full justify-center" size="sm">
              View all notifications
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}