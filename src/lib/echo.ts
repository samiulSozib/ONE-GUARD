// lib/echo.ts - Update the StatusChangeEvent interface
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any> | null;
  }
}

// Only initialize on client side
if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

// Define event types for better type safety
export interface LocationUpdateEvent {
  guard_id: number;
  guard_code: string;
  full_name: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  duty_location_match: boolean;
  distance_from_duty_meters: number;
  battery_level: number | null;
  updated_at: string;
}

export interface StatusChangeEvent {
  guard_id: number;
  guard_code: string;
  full_name: string;
  status: 'online' | 'offline' | 'away' | 'busy' | 'pending';
  last_ping_at: string;
}

const getEchoInstance = (): Echo<any> | null => {
  if (typeof window === 'undefined') return null;

  // Convert string ports to numbers
  const wsPort = process.env.NEXT_PUBLIC_REVERB_PORT
    ? parseInt(process.env.NEXT_PUBLIC_REVERB_PORT, 10)
    : 8080;

  return new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'lg0oii6bejbkeai38awc',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'ogs.api.v1.1guardsecurity.com',
    wsPort: wsPort,
    wssPort: wsPort,
    wsScheme: process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http',
    forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
  });
};

const echo = getEchoInstance();
export default echo;
