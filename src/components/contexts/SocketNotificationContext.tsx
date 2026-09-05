// contexts/SocketNotificationContext.tsx

'use client';

import { soundService } from '@/lib/soundService';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { toast } from 'sonner';

export interface SocketNotification {
  id: string;
  type: 'location' | 'status' | 'alert' | 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
  read: boolean;
}

interface SocketNotificationContextType {
  notifications: SocketNotification[];
  unreadCount: number;
  isSoundEnabled: boolean;
  isNotificationVisible: boolean;
  addNotification: (notification: Omit<SocketNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  clearNotification: (id: string) => void;
  toggleSound: () => void;
  toggleNotificationVisibility: () => void;
  showNotifications: () => void;
  hideNotifications: () => void;
}

const SocketNotificationContext = createContext<SocketNotificationContextType | undefined>(undefined);

export function SocketNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => soundService.loadSettings());
  const [isNotificationVisible, setIsNotificationVisible] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('socket_notification_visibility');
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  // Save visibility preference
  const setVisibilityPreference = useCallback((visible: boolean) => {
    localStorage.setItem('socket_notification_visibility', String(visible));
    setIsNotificationVisible(visible);
  }, []);

  const addNotification = useCallback((notification: Omit<SocketNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: SocketNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Limit notifications to 50
    setNotifications(prev => prev.slice(0, 50));

    // Show toast if notifications are visible
    if (isNotificationVisible) {
      const toastMap: Record<string, (message: any, data?: any) => string | number> = {
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info,
        alert: toast.warning,
      };

      const toastFn = toastMap[notification.type] || toast.info;

      toastFn(notification.title, {
        description: notification.message,
        duration: 4000,
      });
    }

    // Play sound if enabled
    if (isSoundEnabled) {
      soundService.playNotification();
    }
  }, [isNotificationVisible, isSoundEnabled]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const toggleSound = useCallback(() => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    soundService.setEnabled(newState);
  }, [isSoundEnabled]);

  const toggleNotificationVisibility = useCallback(() => {
    const newVisibility = !isNotificationVisible;
    setVisibilityPreference(newVisibility);

    toast.info(
      newVisibility ? 'Notifications enabled' : 'Notifications muted',
      {
        duration: 2000,
        icon: newVisibility ? '🔔' : '🔕',
      }
    );
  }, [isNotificationVisible, setVisibilityPreference]);

  const showNotifications = useCallback(() => {
    setVisibilityPreference(true);
  }, [setVisibilityPreference]);

  const hideNotifications = useCallback(() => {
    setVisibilityPreference(false);
  }, [setVisibilityPreference]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SocketNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isSoundEnabled,
        isNotificationVisible,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        clearNotification,
        toggleSound,
        toggleNotificationVisibility,
        showNotifications,
        hideNotifications,
      }}
    >
      {children}
    </SocketNotificationContext.Provider>
  );
}

export function useSocketNotifications() {
  const context = useContext(SocketNotificationContext);
  if (context === undefined) {
    throw new Error('useSocketNotifications must be used within a SocketNotificationProvider');
  }
  return context;
}
