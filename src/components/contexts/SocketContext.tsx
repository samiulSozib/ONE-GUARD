// contexts/SocketContext.tsx

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import echo, { LocationUpdateEvent, StatusChangeEvent } from '@/lib/echo';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { updateGuardLocation, updateGuardStatus } from '@/store/slices/liveTrackingSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useSocketNotifications } from './SocketNotificationContext';

interface SocketContextType {
  isConnected: boolean;
  lastEvent: LocationUpdateEvent | StatusChangeEvent | null;
  onlineCount: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Helper function to map status
const mapStatus = (status: string): 'online' | 'offline' | 'pending' => {
  switch (status) {
    case 'online':
      return 'online';
    case 'offline':
      return 'offline';
    case 'away':
    case 'busy':
    case 'pending':
    default:
      return 'pending';
  }
};

export function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<LocationUpdateEvent | StatusChangeEvent | null>(null);
  const dispatch = useAppDispatch();
  const { addNotification, isSoundEnabled, isNotificationVisible } = useSocketNotifications();

  useEffect(() => {
    if (!echo) {
      console.warn('Echo not initialized');
      return;
    }

    const channel = echo.channel('live-tracking');

    // Listen for guard location updates
    channel.listen('.guard.location.updated', (event: LocationUpdateEvent) => {
      console.log('📍 Guard location updated:', event);
      setLastEvent(event);

      dispatch(updateGuardLocation({
        guard_id: event.guard_id,
        latitude: event.latitude,
        longitude: event.longitude,
        accuracy: event.accuracy,
        speed: event.speed,
        is_moving: event.speed > 0,
        duty_location_match: event.duty_location_match,
        distance_from_duty_meters: event.distance_from_duty_meters,
        battery_level: event.battery_level,
        updated_at: event.updated_at
      }));

      // Add notification for location updates
      if (isNotificationVisible) {
        addNotification({
          type: 'location',
          title: `📍 ${event.full_name} Location Update`,
          message: `${event.full_name} is ${event.speed > 0 ? 'moving' : 'stationary'}${event.duty_location_match ? ' at duty location' : ` (${Math.round(event.distance_from_duty_meters)}m from duty)`}`,
          data: event,
        });
      }

      // Show warning if guard is away from duty location
      if (!event.duty_location_match && event.distance_from_duty_meters > 100) {
        addNotification({
          type: 'warning',
          title: `🚨 ${event.full_name} is away from duty location!`,
          message: `${Math.round(event.distance_from_duty_meters)}m away from assigned post`,
          data: event,
        });
      }
    });

    // Listen for guard status changes
    channel.listen('.guard.status.changed', (event: StatusChangeEvent) => {
      console.log('🟢 Guard status changed:', event);
      setLastEvent(event);

      const mappedStatus = mapStatus(event.status);

      dispatch(updateGuardStatus({
        guard_id: event.guard_id,
        status: mappedStatus,
        last_ping_at: event.last_ping_at
      }));

      // Add notification for status changes
      if (isNotificationVisible) {
        const statusEmojis: Record<string, string> = {
          online: '🟢',
          offline: '⚫',
          away: '🚶',
          busy: '🔴',
        };
        const emoji = statusEmojis[event.status] || '🔄';

        addNotification({
          type: 'status',
          title: `${emoji} ${event.full_name} is ${event.status}`,
          message: `Status changed to ${event.status}`,
          data: event,
        });
      }
    });

    // Connection event handlers
    const handleConnected = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);

      if (isNotificationVisible) {
        addNotification({
          type: 'success',
          title: '🔌 Connected',
          message: 'Connected to real-time updates',
          data: { connection: 'established' },
        });
      }
    };

    const handleDisconnected = () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);

      if (isNotificationVisible) {
        addNotification({
          type: 'error',
          title: '⚠️ Disconnected',
          message: 'Disconnected from real-time updates',
          data: { connection: 'lost' },
        });
      }
    };

    const handleError = (error: Error) => {
      console.error('WebSocket error:', error);
      addNotification({
        type: 'error',
        title: '⚠️ Connection Error',
        message: 'Connection error. Retrying...',
        data: { error: error.message },
      });
    };

    // Register connection listeners
    if (echo.connector?.pusher?.connection) {
      echo.connector.pusher.connection.bind('connected', handleConnected);
      echo.connector.pusher.connection.bind('disconnected', handleDisconnected);
      echo.connector.pusher.connection.bind('error', handleError);
    }

    // Cleanup
    return () => {
      channel.stopListening('.guard.location.updated');
      channel.stopListening('.guard.status.changed');

      if (echo?.connector?.pusher?.connection) {
        echo.connector.pusher.connection.unbind('connected', handleConnected);
        echo.connector.pusher.connection.unbind('disconnected', handleDisconnected);
        echo.connector.pusher.connection.unbind('error', handleError);
      }

      echo?.leaveChannel('live-tracking');
    };
  }, [dispatch, addNotification, isNotificationVisible]);

  const { guards } = useAppSelector((state) => state.liveTracking);
  const onlineCount = guards.filter(g => g.online_status === 'online').length;

  return (
    <SocketContext.Provider value={{ isConnected, lastEvent, onlineCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
