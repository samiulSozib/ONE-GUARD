// components/shared/socket-notification-bell.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  BellOff,
  BellRing,
  Volume2,
  VolumeX,
  CheckCheck,
  Trash2,
  X,
  ChevronLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useSocketNotifications } from "@/components/contexts/SocketNotificationContext";
import { formatDistanceToNow } from "date-fns";

export function SocketNotificationBell() {
  const {
    notifications,
    unreadCount,
    isSoundEnabled,
    isNotificationVisible,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearNotification,
    toggleSound,
    toggleNotificationVisibility,
  } = useSocketNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'location':
        return '📍';
      case 'status':
        return '🔄';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-950/20';
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'location':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'status':
        return 'border-purple-500 bg-purple-50 dark:bg-purple-950/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const truncateMessage = (message: string, maxLength: number = 60) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-muted/50 rounded-full transition-colors"
        >
          {isNotificationVisible ? (
            unreadCount > 0 ? (
              <>
                <BellRing className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[8px] sm:text-[10px] bg-red-500 border-0 ring-2 ring-background">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </>
            ) : (
              <Bell className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-muted-foreground" />
            )
          ) : (
            <BellOff className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-muted-foreground" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "p-0 overflow-hidden",
          isMobile
            ? "fixed bottom-0 left-0 right-0 top-auto max-h-[85vh] w-full rounded-t-2xl rounded-b-none border-b-0"
            : "w-[95vw] max-w-[420px] sm:w-96"
        )}
        align={isMobile ? "center" : "end"}
        side={isMobile ? "top" : "bottom"}
        sideOffset={isMobile ? 0 : 5}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-2 min-w-0">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 flex-shrink-0"
                  onClick={() => setIsOpen(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <span className="font-semibold text-sm sm:text-base truncate">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              {/* Sound Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                onClick={toggleSound}
                title={isSoundEnabled ? 'Mute sounds' : 'Enable sounds'}
              >
                {isSoundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </Button>

              {/* Notification Visibility Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                onClick={toggleNotificationVisibility}
                title={isNotificationVisible ? 'Hide notifications' : 'Show notifications'}
              >
                {isNotificationVisible ? (
                  <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                ) : (
                  <BellOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                )}
              </Button>

              <div className="w-px h-5 bg-border mx-0.5 sm:mx-1" />

              {/* Mark All Read */}
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-3 w-3 mr-0.5 sm:mr-1" />
                  <span className="hidden xs:inline">Read all</span>
                </Button>
              )}

              {/* Clear All */}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs text-destructive hover:text-destructive"
                  onClick={clearAll}
                >
                  <Trash2 className="h-3 w-3 mr-0.5 sm:mr-1" />
                  <span className="hidden xs:inline">Clear</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notification List */}
        <ScrollArea className={cn(
          "overflow-y-auto",
          isMobile ? "h-[calc(85vh-120px)]" : "max-h-[400px]"
        )}>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
              <Bell className="h-12 w-12 sm:h-14 sm:w-14 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
                Real-time updates will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2 sm:p-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative rounded-lg border p-2.5 sm:p-3 transition-all cursor-pointer hover:bg-muted/50 active:scale-[0.98]",
                    getNotificationColor(notification.type),
                    !notification.read && "border-l-4 border-l-blue-500"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 text-base sm:text-lg leading-none mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5">
                        <p className="text-xs sm:text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive flex-shrink-0 -mt-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {truncateMessage(notification.message)}
                      </p>
                      <p className="text-[8px] sm:text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer Status */}
        <div className="sticky bottom-0 bg-background border-t px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-1.5 w-1.5 rounded-full flex-shrink-0",
                isNotificationVisible ? "bg-green-500" : "bg-gray-400"
              )} />
              <span className="truncate">
                {isNotificationVisible ? 'Notifications on' : 'Notifications off'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-1.5 w-1.5 rounded-full flex-shrink-0",
                isSoundEnabled ? "bg-green-500" : "bg-gray-400"
              )} />
              <span className="truncate">{isSoundEnabled ? 'Sound on' : 'Sound off'}</span>
            </div>
            {notifications.length > 0 && (
              <span className="text-[10px] text-muted-foreground/60">
                {notifications.length} total
              </span>
            )}
          </div>
        </div>

        {/* Mobile Close Handle */}
        {isMobile && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
