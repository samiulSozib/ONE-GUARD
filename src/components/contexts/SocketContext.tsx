// contexts/SocketContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import echo, { LocationUpdateEvent, StatusChangeEvent } from '@/lib/echo';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { updateGuardLocation, updateGuardStatus } from '@/store/slices/liveTrackingSlice';
import { toast } from 'sonner';
import { soundService } from '@/lib/soundService';
import { useAppSelector } from '@/hooks/useAppSelector';

interface SocketContextType {
  isConnected: boolean;
  lastEvent: LocationUpdateEvent | StatusChangeEvent | null;
  onlineCount: number;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Helper function to map status to the expected type
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

// Track played notifications to avoid duplicates
const recentNotifications = new Map<number, number>();
const NOTIFICATION_COOLDOWN = 10000; // 10 seconds

const shouldPlayNotification = (guardId: number, status: string): boolean => {
  const lastPlayed = recentNotifications.get(guardId);
  const now = Date.now();
  if (!lastPlayed || now - lastPlayed > NOTIFICATION_COOLDOWN) {
    recentNotifications.set(guardId, now);
    return true;
  }
  return false;
};

export function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<LocationUpdateEvent | StatusChangeEvent | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => soundService.loadSettings()); // ✅ Initialize with function
  const dispatch = useAppDispatch();

  const toggleSound = useCallback(() => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundService.setEnabled(newState);
  }, [soundEnabled]);

  useEffect(() => {
    if (!echo) {
      console.warn('Echo not initialized');
      return;
    }

    // Subscribe to the live-tracking channel
    const channel = echo.channel('live-tracking');

    // Listen for guard location updates
    channel.listen('.guard.location.updated', (event: LocationUpdateEvent) => {
      console.log('📍 Guard location updated:', event);
      setLastEvent(event);
      
      // Update Redux store
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

      // Show warning if guard is away from duty location
      if (!event.duty_location_match && event.distance_from_duty_meters > 100) {
        toast.warning(`${event.full_name} is away from duty location!`, {
          description: `${Math.round(event.distance_from_duty_meters)}m away from assigned post`,
          duration: 5000,
          icon: '🚨',
        });
      }
    });

    // Listen for guard status changes
    channel.listen('.guard.status.changed', (event: StatusChangeEvent) => {
      console.log('🟢 Guard status changed:', event);
      setLastEvent(event);
      
      const mappedStatus = mapStatus(event.status);
      
      // Update Redux store
      dispatch(updateGuardStatus({
        guard_id: event.guard_id,
        status: mappedStatus,
        last_ping_at: event.last_ping_at
      }));

      // Play sound and show notification based on status
      if (shouldPlayNotification(event.guard_id, event.status)) {
        if (event.status === 'online') {
          soundService.playOnline();
          toast.success(`${event.full_name} is now online`, {
            duration: 3000,
            icon: '🟢',
          });
        } else if (event.status === 'offline') {
          soundService.playOffline();
          toast.info(`${event.full_name} went offline`, {
            duration: 3000,
            icon: '⚫',
          });
        } else if (event.status === 'away') {
          soundService.playAway();
          toast.info(`${event.full_name} is away`, {
            duration: 3000,
            icon: '🚶',
          });
        } else if (event.status === 'busy') {
          soundService.playAway();
          toast.info(`${event.full_name} is busy`, {
            duration: 3000,
            icon: '🔴',
          });
        }
      }
    });

    // Connection event handlers
    const handleConnected = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      toast.success('Connected to real-time updates', {
        duration: 2000,
        icon: '🔌',
      });
    };

    const handleDisconnected = () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
      toast.error('Disconnected from real-time updates', {
        duration: 2000,
        icon: '⚠️',
      });
    };

    const handleError = (error: Error) => {
      console.error('WebSocket error:', error);
      toast.error('Connection error. Retrying...', {
        duration: 3000,
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
  }, [dispatch]);

  // ✅ Calculate online count during render, not in an Effect
  const { guards } = useAppSelector((state) => state.liveTracking);
  const onlineCount = guards.filter(g => g.online_status === 'online').length;

  return (
    <SocketContext.Provider value={{ isConnected, lastEvent, onlineCount, soundEnabled, toggleSound }}>
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