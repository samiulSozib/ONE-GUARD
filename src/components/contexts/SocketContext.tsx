// src/components/contexts/SocketContext.tsx

"use client"

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

import echo, {
  LocationUpdateEvent,
  StatusChangeEvent,
} from "@/lib/echo"

import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"

import {
  updateGuardLocation,
  updateGuardStatus,
} from "@/store/slices/liveTrackingSlice"

import { useSocketNotifications } from "./SocketNotificationContext"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface SocketContextType {
  isConnected: boolean
  lastEvent: LocationUpdateEvent | StatusChangeEvent | null
  onlineCount: number
}

/* -------------------------------------------------------------------------- */
/* Context                                                                    */
/* -------------------------------------------------------------------------- */

const SocketContext = createContext<SocketContextType | undefined>(
  undefined
)

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const mapStatus = (
  status: string
): "online" | "offline" | "pending" => {
  switch (status) {
    case "online":
      return "online"

    case "offline":
      return "offline"

    case "away":
    case "busy":
    case "pending":
    default:
      return "pending"
  }
}

const formatDistance = (
  distance: number | null | undefined
): string => {
  if (
    distance === null ||
    distance === undefined ||
    Number.isNaN(Number(distance))
  ) {
    return "Unknown distance"
  }

  const numericDistance = Number(distance)

  if (numericDistance >= 1000) {
    return `${(numericDistance / 1000).toFixed(2)} km`
  }

  return `${Math.round(numericDistance)} m`
}

/* -------------------------------------------------------------------------- */
/* Provider                                                                   */
/* -------------------------------------------------------------------------- */

export function SocketProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isConnected, setIsConnected] =
    useState(false)

  const [lastEvent, setLastEvent] =
    useState<
      LocationUpdateEvent | StatusChangeEvent | null
    >(null)

  const dispatch = useAppDispatch()

  const {
    addNotification,
    isNotificationVisible,
  } = useSocketNotifications()

  /* ------------------------------------------------------------------------ */
  /* WebSocket / Laravel Echo                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!echo) {
      console.warn("Echo not initialized")
      return
    }

    const channel = echo.channel("live-tracking")

    /* ---------------------------------------------------------------------- */
    /* Guard Location Updated                                                 */
    /* ---------------------------------------------------------------------- */

    channel.listen(
      ".guard.location.updated",
      (event: LocationUpdateEvent) => {
        console.log(
          "📍 Guard location updated:",
          event
        )

        setLastEvent(event)

        const speed =
          event.speed === null ||
            event.speed === undefined
            ? null
            : Number(event.speed)

        const isMoving =
          speed !== null && speed > 0

        const distance =
          event.distance_from_duty_meters ===
            null ||
            event.distance_from_duty_meters ===
            undefined
            ? null
            : Number(
              event.distance_from_duty_meters
            )

        dispatch(
          updateGuardLocation({
            guard_id: event.guard_id,

            latitude: Number(event.latitude),
            longitude: Number(event.longitude),

            accuracy:
              event.accuracy === null ||
                event.accuracy === undefined
                ? null
                : Number(event.accuracy),

            speed,
            is_moving: isMoving,

            /**
             * IMPORTANT:
             *
             * Laravel is authoritative for geofence
             * validation.
             *
             * React must NOT calculate its own radius
             * threshold.
             */
            duty_location_match:
              event.duty_location_match,

            distance_from_duty_meters:
              distance,

            battery_level:
              event.battery_level === null ||
                event.battery_level === undefined
                ? null
                : Number(event.battery_level),

            updated_at: event.updated_at,
          })
        )

        /* ------------------------------------------------------------------ */
        /* Standard realtime notification                                     */
        /* ------------------------------------------------------------------ */

        if (isNotificationVisible) {
          let locationMessage = ""

          if (
            event.duty_location_match === true
          ) {
            locationMessage =
              "inside assigned duty geofence"
          } else if (
            event.duty_location_match === false
          ) {
            locationMessage =
              distance !== null
                ? `${formatDistance(
                  distance
                )} from assigned post`
                : "outside assigned duty geofence"
          } else {
            locationMessage =
              "location updated"
          }

          addNotification({
            type: "location",

            title: `📍 ${event.full_name} Location Update`,

            message: `${event.full_name} is ${isMoving
              ? "moving"
              : "stationary"
              } — ${locationMessage}`,

            data: event,
          })
        }

        /* ------------------------------------------------------------------ */
        /* Geofence Warning                                                   */
        /* ------------------------------------------------------------------ */

        /**
         * DO NOT use:
         *
         * distance > 100
         * distance > 250
         * etc.
         *
         * The backend SettingService decides the
         * allowed radius and sends the authoritative
         * duty_location_match result.
         */
        if (
          event.duty_location_match === false
        ) {
          addNotification({
            type: "warning",

            title: `🚨 ${event.full_name} is outside the assigned geofence`,

            message:
              distance !== null
                ? `${formatDistance(
                  distance
                )} from assigned post`
                : "Guard is outside the assigned duty location",

            data: event,
          })
        }
      }
    )

    /* ---------------------------------------------------------------------- */
    /* Guard Online Status Changed                                            */
    /* ---------------------------------------------------------------------- */

    channel.listen(
      ".guard.status.changed",
      (event: StatusChangeEvent) => {
        console.log(
          "🟢 Guard status changed:",
          event
        )

        setLastEvent(event)

        const mappedStatus =
          mapStatus(event.status)

        dispatch(
          updateGuardStatus({
            guard_id: event.guard_id,
            status: mappedStatus,
            last_ping_at:
              event.last_ping_at ?? null,
          })
        )

        if (isNotificationVisible) {
          const statusEmojis: Record<
            string,
            string
          > = {
            online: "🟢",
            offline: "⚫",
            away: "🚶",
            busy: "🔴",
            pending: "🟡",
          }

          const emoji =
            statusEmojis[event.status] ?? "🔄"

          addNotification({
            type: "status",

            title: `${emoji} ${event.full_name} is ${event.status}`,

            message: `Status changed to ${event.status}`,

            data: event,
          })
        }
      }
    )

    /* ---------------------------------------------------------------------- */
    /* Connection Events                                                      */
    /* ---------------------------------------------------------------------- */

    const connection =
      echo.connector?.pusher?.connection

    const handleConnected = () => {
      console.log(
        "✅ WebSocket connected"
      )

      setIsConnected(true)

      if (isNotificationVisible) {
        addNotification({
          type: "success",
          title: "🔌 Connected",
          message:
            "Connected to real-time guard updates",
          data: {
            connection: "established",
          },
        })
      }
    }

    const handleDisconnected = () => {
      console.log(
        "❌ WebSocket disconnected"
      )

      setIsConnected(false)

      if (isNotificationVisible) {
        addNotification({
          type: "error",
          title: "⚠️ Disconnected",
          message:
            "Disconnected from real-time guard updates",
          data: {
            connection: "lost",
          },
        })
      }
    }

    const handleError = (
      error: Error
    ) => {
      console.error(
        "WebSocket error:",
        error
      )

      setIsConnected(false)

      addNotification({
        type: "error",
        title: "⚠️ Connection Error",
        message:
          "Realtime connection error. Retrying...",
        data: {
          error:
            error?.message ??
            "Unknown WebSocket error",
        },
      })
    }

    if (connection) {
      connection.bind(
        "connected",
        handleConnected
      )

      connection.bind(
        "disconnected",
        handleDisconnected
      )

      connection.bind(
        "error",
        handleError
      )

      /**
       * Echo may already be connected before this
       * React provider mounts.
       */
      if (
        connection.state === "connected"
      ) {
        setIsConnected(true)
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Cleanup                                                                */
    /* ---------------------------------------------------------------------- */

    return () => {
      channel.stopListening(
        ".guard.location.updated"
      )

      channel.stopListening(
        ".guard.status.changed"
      )

      if (connection) {
        connection.unbind(
          "connected",
          handleConnected
        )

        connection.unbind(
          "disconnected",
          handleDisconnected
        )

        connection.unbind(
          "error",
          handleError
        )
      }

      echo?.leaveChannel(
        "live-tracking"
      )
    }
  }, [
    dispatch,
    addNotification,
    isNotificationVisible,
  ])

  /* ------------------------------------------------------------------------ */
  /* Derived Values                                                           */
  /* ------------------------------------------------------------------------ */

  const { guards } = useAppSelector(
    (state) => state.liveTracking
  )

  const onlineCount =
    guards.filter(
      (guard) =>
        guard.online_status === "online"
    ).length

  /* ------------------------------------------------------------------------ */
  /* Provider                                                                 */
  /* ------------------------------------------------------------------------ */

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        lastEvent,
        onlineCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useSocket() {
  const context =
    useContext(SocketContext)

  if (context === undefined) {
    throw new Error(
      "useSocket must be used within a SocketProvider"
    )
  }

  return context
}