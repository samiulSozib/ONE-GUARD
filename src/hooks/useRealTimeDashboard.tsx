// hooks/useRealtimeDashboard.ts
'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { fetchLiveGuards } from '@/store/slices/liveTrackingSlice';
import echo, { LocationUpdateEvent, StatusChangeEvent } from '@/lib/echo';
import { toast } from 'sonner';
import { fetchDashboard } from '@/store/slices/dashboardSlice';
import { useAppSelector } from './useAppSelector';

// Helper function to map status
const mapStatus = (status: string): 'online' | 'offline' | 'pending' => {
  switch (status) {
    case 'online':
      return 'online';
    case 'offline':
      return 'offline';
    default:
      return 'pending';
  }
};

export function useRealtimeDashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useAppDispatch();
  const { guards } = useAppSelector((state) => state.liveTracking);

  // Calculate online count directly from guards instead of using state
  const onlineCount = guards.filter(g => g.online_status === 'online').length;
  const totalGuards = guards.length;

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchLiveGuards({ per_page: 100 }));
    dispatch(fetchDashboard());
  }, [dispatch]);

  // WebSocket connection
  useEffect(() => {
    if (!echo) {
      console.warn('Echo not initialized');
      return;
    }

    const channel = echo.channel('live-tracking');

    // Location updates
    const handleLocationUpdate = (event: LocationUpdateEvent) => {
      console.log('📍 Location update:', event);
      // The Redux slice will handle the update via the SocketContext
    };

    // Status changes
    const handleStatusChange = (event: StatusChangeEvent) => {
      console.log('🟢 Status change:', event);
      
      const mappedStatus = mapStatus(event.status);
      
      // Show notification for status change
      if (mappedStatus === 'online') {
        toast.success(`${event.full_name} is now online`, {
          duration: 3000,
          icon: '🟢',
        });
      } else if (mappedStatus === 'offline') {
        toast.info(`${event.full_name} went offline`, {
          duration: 3000,
          icon: '⚫',
        });
      } else if (event.status === 'away') {
        toast.info(`${event.full_name} is away`, {
          duration: 3000,
          icon: '🚶',
        });
      } else if (event.status === 'busy') {
        toast.info(`${event.full_name} is busy`, {
          duration: 3000,
          icon: '🔴',
        });
      }
    };

    // Connection events
    const handleConnected = () => {
      setIsConnected(true);
      toast.success('Connected to real-time updates', {
        duration: 2000,
        icon: '🔌',
      });
    };

    const handleDisconnected = () => {
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

    // Register listeners
    channel.listen('.guard.location.updated', handleLocationUpdate);
    channel.listen('.guard.status.changed', handleStatusChange);
    
    if (echo.connector?.pusher?.connection) {
      echo.connector.pusher.connection.bind('connected', handleConnected);
      echo.connector.pusher.connection.bind('disconnected', handleDisconnected);
      echo.connector.pusher.connection.bind('error', handleError);
    }

    // Cleanup
    return () => {
      channel.stopListening('.guard.location.updated', handleLocationUpdate);
      channel.stopListening('.guard.status.changed', handleStatusChange);
      
      if (echo?.connector?.pusher?.connection) {
        echo.connector.pusher.connection.unbind('connected', handleConnected);
        echo.connector.pusher.connection.unbind('disconnected', handleDisconnected);
        echo.connector.pusher.connection.unbind('error', handleError);
      }
      
      echo?.leaveChannel('live-tracking');
    };
  }, []); // Remove guards dependency to avoid re-subscriptions

  return { isConnected, onlineCount, totalGuards };
}