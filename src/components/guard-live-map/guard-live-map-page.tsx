"use client"

import {
  AlertTriangle,
  Battery,
  Building2,
  Clock3,
  Crosshair,
  ExternalLink,
  History,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  ShieldCheck,
  Signal,
  UserCheck,
  Users,
  UserX,
  Wifi,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import type {
  LiveGuard,
  LocationHistoryPoint,
} from "@/app/types/liveTracking"

import { useSocket } from "@/components/contexts/SocketContext"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import {
  clearLocationHistory,
  fetchGuardLocationHistory,
  fetchLiveGuards,
  setSelectedGuard,
} from "@/store/slices/liveTrackingSlice"

type GuardFilter =
  | "all"
  | "online"
  | "offline"
  | "on_duty"
  | "outside"
  | "moving"

type PanelTab =
  | "overview"
  | "live"
  | "assignment"
  | "history"

declare global {
  interface Window {
    google: typeof google
  }
}

interface GuardOverlay {
  overlay: google.maps.OverlayView
  guardId: number
  element: HTMLDivElement
}

interface SiteOverlay {
  overlay: google.maps.OverlayView
  key: string
  element: HTMLDivElement
}

const DEFAULT_CENTER = {
  lat: 34.5553,
  lng: 69.2075,
}

const isFiniteNumber = (
  value: string | number | null | undefined
) => {
  const number = Number(value)
  return Number.isFinite(number)
}

const hasValidCoordinates = (
  latitude: string | number | null | undefined,
  longitude: string | number | null | undefined
) => {
  if (
    !isFiniteNumber(latitude) ||
    !isFiniteNumber(longitude)
  ) {
    return false
  }

  const lat = Number(latitude)
  const lng = Number(longitude)

  return (
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  )
}

const escapeHtml = (
  value: string | number | null | undefined
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return ""
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

const formatDistance = (
  value: string | number | null | undefined
) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "N/A"
  }

  const meters = Number(value)

  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`
  }

  return `${Math.round(meters)} m`
}

const formatSpeed = (
  value: string | number | null | undefined
) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "0"
  }

  return Number(value).toFixed(1)
}

const formatBattery = (
  value: string | number | null | undefined
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "N/A"
  }

  return `${value}%`
}

const formatDateTime = (
  value: string | null | undefined
) => {
  if (!value) {
    return "N/A"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

const getGuardVisualState = (
  guard: LiveGuard,
  selected: boolean
) => {
  if (selected) {
    return {
      color: "#2563eb",
      soft: "#dbeafe",
      label: "Selected",
    }
  }

  if (guard.online_status !== "online") {
    return {
      color: "#64748b",
      soft: "#e2e8f0",
      label: "Offline",
    }
  }

  if (
    guard.current_assignment &&
    guard.location?.duty_location_match === false
  ) {
    return {
      color: "#dc2626",
      soft: "#fee2e2",
      label: "Outside",
    }
  }

  return {
    color: "#10b981",
    soft: "#d1fae5",
    label: "Online",
  }
}

const getAvatarSrc = (
  profileImage: string | null
) => {
  if (!profileImage) {
    return "/images/avatar.png"
  }

  if (
    profileImage.startsWith("http://") ||
    profileImage.startsWith("https://") ||
    profileImage.startsWith("/")
  ) {
    return profileImage
  }

  return `/${profileImage}`
}

const buildGuardMarkerHtml = (
  guard: LiveGuard,
  selected: boolean
) => {
  const visual =
    getGuardVisualState(
      guard,
      selected
    )

  const distance =
    formatDistance(
      guard.location
        ?.distance_from_duty_meters
    )

  const assignmentText =
    guard.online_status === "online"
      ? guard.current_assignment
        ? "On duty"
        : "Online"
      : "Offline"

  const distanceText =
    guard.current_assignment &&
      guard.location
      ? guard.location
        .duty_location_match === false
        ? `${distance} away`
        : distance !== "N/A"
          ? distance
          : ""
      : guard.location?.updated_ago ??
      ""

  const warning =
    guard.current_assignment &&
    guard.location
      ?.duty_location_match === false

  const moving =
    guard.location?.is_moving === true

  const avatar =
    escapeHtml(
      getAvatarSrc(
        guard.profile_image
      )
    )

  const name =
    escapeHtml(guard.full_name)

  return `
    <div
      data-guard-marker="${guard.id}"
      style="
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 142px;
        max-width: 220px;
        padding: 7px 10px 7px 7px;
        border-radius: 12px;
        border: 1px solid ${selected
      ? "#2563eb"
      : "#e4e4e7"
    };
        background: rgba(255,255,255,0.96);
        box-shadow: 0 8px 24px rgba(15,23,42,0.14);
        cursor: pointer;
        transform: translate(-20px,-50%);
        font-family: Arial, sans-serif;
        white-space: nowrap;
        backdrop-filter: blur(8px);
      "
    >
      <div
        style="
          position: relative;
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          border-radius: 999px;
          padding: 2px;
          background: ${visual.color};
          box-shadow: 0 2px 8px ${visual.color}45;
        "
      >
        <img
          src="${avatar}"
          alt=""
          style="
            width: 34px;
            height: 34px;
            display: block;
            object-fit: cover;
            border-radius: 999px;
            background: #f4f4f5;
          "
          onerror="this.src='/images/avatar.png'"
        />

        <span
          style="
            position: absolute;
            right: -1px;
            bottom: -1px;
            width: 10px;
            height: 10px;
            border-radius: 999px;
            border: 2px solid white;
            background: ${visual.color};
          "
        ></span>
      </div>

      <div style="min-width:0;line-height:1.15;">
        <div
          style="
            display:flex;
            align-items:center;
            gap:5px;
            color:#18181b;
            font-size:12px;
            font-weight:700;
          "
        >
          <span style="overflow:hidden;text-overflow:ellipsis;max-width:125px;">
            ${name}
          </span>

          ${warning
      ? '<span style="color:#dc2626;font-size:11px;">▲</span>'
      : ""
    }
        </div>

        <div
          style="
            display:flex;
            align-items:center;
            gap:5px;
            margin-top:4px;
            color:#71717a;
            font-size:10px;
            font-weight:600;
          "
        >
          <span
            style="
              width:7px;
              height:7px;
              border-radius:999px;
              background:${visual.color};
              flex:0 0 7px;
            "
          ></span>

          <span>${assignmentText}</span>

          ${distanceText
      ? `<span>• ${escapeHtml(distanceText)}</span>`
      : ""
    }

          ${moving
      ? '<span style="color:#7c3aed;">➤</span>'
      : ""
    }
        </div>
      </div>

      <span
        style="
          position:absolute;
          left:16px;
          bottom:-8px;
          width:0;
          height:0;
          border-left:7px solid transparent;
          border-right:7px solid transparent;
          border-top:9px solid white;
          filter:drop-shadow(0 2px 1px rgba(15,23,42,0.08));
        "
      ></span>
    </div>
  `
}

const buildSiteLabelHtml = (
  siteName: string,
  radius: number
) => {
  return `
    <div
      style="
        transform: translate(-50%,-50%);
        min-width: 130px;
        max-width: 210px;
        padding: 8px 12px;
        border: 1px solid #fecaca;
        border-radius: 10px;
        background: rgba(255,255,255,0.96);
        box-shadow: 0 7px 20px rgba(15,23,42,0.10);
        text-align: center;
        font-family: Arial, sans-serif;
        pointer-events: none;
        backdrop-filter: blur(8px);
      "
    >
      <div
        style="
          color:#18181b;
          font-size:11px;
          font-weight:700;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        "
      >
        ${escapeHtml(siteName)}
      </div>

      <div
        style="
          margin-top:3px;
          color:#71717a;
          font-size:10px;
          font-weight:600;
        "
      >
        ${escapeHtml(formatDistance(radius))} radius
      </div>
    </div>
  `
}

const createHtmlOverlay = (
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  html: string,
  onClick?: () => void
): GuardOverlay["overlay"] => {
  class HtmlOverlay extends window.google.maps.OverlayView {
    private readonly position:
      google.maps.LatLngLiteral

    private readonly html: string

    private element:
      HTMLDivElement | null = null

    private readonly onClick?:
      () => void

    constructor() {
      super()

      this.position = position
      this.html = html
      this.onClick = onClick
    }

    onAdd() {
      const div =
        document.createElement(
          "div"
        )

      div.style.position =
        "absolute"

      div.style.zIndex = "20"

      div.innerHTML =
        this.html

      if (this.onClick) {
        div.addEventListener(
          "click",
          this.onClick
        )
      }

      this.element = div

      this.getPanes()
        ?.overlayMouseTarget.appendChild(
          div
        )
    }

    draw() {
      if (!this.element) {
        return
      }

      const projection =
        this.getProjection()

      const point =
        projection.fromLatLngToDivPixel(
          new window.google.maps.LatLng(
            this.position.lat,
            this.position.lng
          )
        )

      if (!point) {
        return
      }

      this.element.style.left =
        `${point.x}px`

      this.element.style.top =
        `${point.y}px`
    }

    onRemove() {
      if (
        this.element?.parentNode
      ) {
        this.element.parentNode.removeChild(
          this.element
        )
      }

      this.element = null
    }
  }

  const overlay =
    new HtmlOverlay()

  overlay.setMap(map)

  return overlay
}

export default function GuardLiveMapPage() {
  const dispatch =
    useAppDispatch()

  const {
    guards,
    totalOnline,
    totalOffline,
    totalGuards,
    totalOnDuty,
    totalMoving,
    totalOutsideGeofence,
    lastUpdated,
    selectedGuard,
    locationHistory,
    historyTotalPoints,
    isLoading,
    error,
  } = useAppSelector(
    (state) =>
      state.liveTracking
  )

  const { isConnected } =
    useSocket()

  const [filter, setFilter] =
    useState<GuardFilter>("all")

  const [search, setSearch] =
    useState("")

  const [mapLoaded, setMapLoaded] =
    useState(false)

  const [mapError, setMapError] =
    useState<string | null>(null)

  const [panelTab, setPanelTab] =
    useState<PanelTab>("overview")

  const mapContainerRef =
    useRef<HTMLDivElement | null>(
      null
    )

  const mapRef =
    useRef<google.maps.Map | null>(
      null
    )

  const guardOverlaysRef =
    useRef<
      Map<number, GuardOverlay>
    >(new Map())

  const geofenceCirclesRef =
    useRef<
      Map<string, google.maps.Circle>
    >(new Map())

  const siteMarkersRef =
    useRef<
      Map<string, google.maps.Marker>
    >(new Map())

  const siteOverlaysRef =
    useRef<
      Map<string, SiteOverlay>
    >(new Map())

  const hasAutoPositionedRef =
    useRef(false)

  useEffect(() => {
    dispatch(
      fetchLiveGuards({
        per_page: 500,
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return
    }

    if (
      window.google?.maps
    ) {
      setMapLoaded(true)
      return
    }

    const existingScript =
      document.getElementById(
        "google-maps-script"
      ) as HTMLScriptElement | null

    if (existingScript) {
      const onLoad = () => {
        setMapLoaded(true)
        setMapError(null)
      }

      const onError = () => {
        setMapError(
          "Failed to load Google Maps."
        )
      }

      existingScript.addEventListener(
        "load",
        onLoad
      )

      existingScript.addEventListener(
        "error",
        onError
      )

      return () => {
        existingScript.removeEventListener(
          "load",
          onLoad
        )

        existingScript.removeEventListener(
          "error",
          onError
        )
      }
    }

    const apiKey =
      process.env
        .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setMapError(
        "Google Maps API key is not configured."
      )

      return
    }

    const script =
      document.createElement(
        "script"
      )

    script.id =
      "google-maps-script"

    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`

    script.async = true
    script.defer = true

    script.onload = () => {
      setMapLoaded(true)
      setMapError(null)
    }

    script.onerror = () => {
      setMapError(
        "Failed to load Google Maps."
      )
    }

    document.head.appendChild(
      script
    )
  }, [])

  const filteredGuards =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase()

      return guards.filter(
        (guard) => {
          const matchesSearch =
            !normalizedSearch ||
            guard.full_name
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            guard.guard_code
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            guard.current_assignment
              ?.site_name
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            guard.current_assignment
              ?.duty_title
              ?.toLowerCase()
              .includes(
                normalizedSearch
              )

          if (!matchesSearch) {
            return false
          }

          switch (filter) {
            case "online":
              return (
                guard.online_status ===
                "online"
              )

            case "offline":
              return (
                guard.online_status ===
                "offline"
              )

            case "on_duty":
              return (
                guard.current_assignment !==
                null
              )

            case "outside":
              return (
                guard.current_assignment !==
                null &&
                guard.location !== null &&
                guard.location
                  .duty_location_match ===
                false
              )

            case "moving":
              return (
                guard.location
                  ?.is_moving ===
                true
              )

            default:
              return true
          }
        }
      )
    }, [
      guards,
      filter,
      search,
    ])

  const mappableGuards =
    useMemo(
      () =>
        filteredGuards.filter(
          (guard) =>
            guard.location &&
            hasValidCoordinates(
              guard.location
                .latitude,
              guard.location
                .longitude
            )
        ),
      [filteredGuards]
    )

  const selectedGuardFromStore =
    useMemo(() => {
      if (!selectedGuard) {
        return null
      }

      return (
        guards.find(
          (guard) =>
            guard.id ===
            selectedGuard.id
        ) ?? selectedGuard
      )
    }, [
      guards,
      selectedGuard,
    ])

  useEffect(() => {
    if (
      !mapLoaded ||
      !mapContainerRef.current ||
      !window.google?.maps
    ) {
      return
    }

    if (mapRef.current) {
      return
    }

    mapRef.current =
      new window.google.maps.Map(
        mapContainerRef.current,
        {
          center:
            DEFAULT_CENTER,

          zoom: 12,

          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,

          gestureHandling:
            "greedy",

          clickableIcons: false,

          styles: [
            {
              featureType:
                "poi.business",
              stylers: [
                {
                  visibility:
                    "simplified",
                },
              ],
            },
          ],
        }
      )
  }, [mapLoaded])

  useEffect(() => {
    if (
      !mapLoaded ||
      !mapRef.current ||
      !window.google?.maps
    ) {
      return
    }

    guardOverlaysRef.current.forEach(
      ({ overlay }) =>
        overlay.setMap(null)
    )

    guardOverlaysRef.current.clear()

    mappableGuards.forEach(
      (guard) => {
        if (!guard.location) {
          return
        }

        const position = {
          lat: Number(
            guard.location.latitude
          ),

          lng: Number(
            guard.location.longitude
          ),
        }

        const isSelected =
          selectedGuardFromStore?.id ===
          guard.id

        const overlay =
          createHtmlOverlay(
            mapRef.current!,
            position,
            buildGuardMarkerHtml(
              guard,
              isSelected
            ),
            () => {
              dispatch(
                setSelectedGuard(
                  guard
                )
              )

              setPanelTab(
                "overview"
              )
            }
          )

        const element =
          document.createElement(
            "div"
          )

        guardOverlaysRef.current.set(
          guard.id,
          {
            overlay,
            guardId:
              guard.id,
            element,
          }
        )
      }
    )

    return () => {
      guardOverlaysRef.current.forEach(
        ({ overlay }) =>
          overlay.setMap(null)
      )

      guardOverlaysRef.current.clear()
    }
  }, [
    dispatch,
    mapLoaded,
    mappableGuards,
    selectedGuardFromStore?.id,
  ])

  useEffect(() => {
    if (
      !mapLoaded ||
      !mapRef.current ||
      !window.google?.maps
    ) {
      return
    }

    const map =
      mapRef.current

    const activeKeys =
      new Set<string>()

    filteredGuards.forEach(
      (guard) => {
        const assignment =
          guard.current_assignment

        const geofence =
          assignment?.geofence

        if (
          !assignment ||
          !geofence ||
          !hasValidCoordinates(
            geofence.latitude,
            geofence.longitude
          )
        ) {
          return
        }

        const radius =
          Number(
            geofence.radius_meters
          )

        if (
          !Number.isFinite(
            radius
          ) ||
          radius <= 0
        ) {
          return
        }

        const key =
          assignment.site_location_id
            ? `location-${assignment.site_location_id}`
            : `site-${assignment.site_id ?? guard.id}`

        activeKeys.add(key)

        const center = {
          lat: Number(
            geofence.latitude
          ),

          lng: Number(
            geofence.longitude
          ),
        }

        let circle =
          geofenceCirclesRef.current.get(
            key
          )

        if (!circle) {
          circle =
            new window.google.maps.Circle(
              {
                map,
                center,
                radius,

                strokeColor:
                  "#ef4444",

                strokeOpacity:
                  0.8,

                strokeWeight: 2,

                fillColor:
                  "#ef4444",

                fillOpacity:
                  0.13,

                clickable: false,

                zIndex: 5,
              }
            )

          geofenceCirclesRef.current.set(
            key,
            circle
          )
        } else {
          circle.setMap(map)
          circle.setCenter(
            center
          )
          circle.setRadius(
            radius
          )
        }

        let siteMarker =
          siteMarkersRef.current.get(
            key
          )

        if (!siteMarker) {
          siteMarker =
            new window.google.maps.Marker(
              {
                map,
                position:
                  center,

                title:
                  assignment.site_name ??
                  "Site Location",

                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 9,
                  fillColor:
                    "#dc2626",
                  fillOpacity: 1,
                  strokeColor:
                    "#ffffff",
                  strokeWeight: 3,
                },

                zIndex: 15,
              }
            )

          siteMarkersRef.current.set(
            key,
            siteMarker
          )
        } else {
          siteMarker.setMap(map)
          siteMarker.setPosition(
            center
          )
        }

        if (
          !siteOverlaysRef.current.has(
            key
          )
        ) {
          const overlay =
            createHtmlOverlay(
              map,
              center,
              buildSiteLabelHtml(
                assignment.site_name ??
                assignment.site_location
                  ?.name ??
                "Site Location",
                radius
              )
            )

          const element =
            document.createElement(
              "div"
            )

          siteOverlaysRef.current.set(
            key,
            {
              overlay,
              key,
              element,
            }
          )
        }
      }
    )

    geofenceCirclesRef.current.forEach(
      (circle, key) => {
        if (
          !activeKeys.has(key)
        ) {
          circle.setMap(null)

          geofenceCirclesRef.current.delete(
            key
          )
        }
      }
    )

    siteMarkersRef.current.forEach(
      (marker, key) => {
        if (
          !activeKeys.has(key)
        ) {
          marker.setMap(null)

          siteMarkersRef.current.delete(
            key
          )
        }
      }
    )

    siteOverlaysRef.current.forEach(
      ({ overlay }, key) => {
        if (
          !activeKeys.has(key)
        ) {
          overlay.setMap(null)

          siteOverlaysRef.current.delete(
            key
          )
        }
      }
    )
  }, [
    filteredGuards,
    mapLoaded,
  ])

  useEffect(() => {
    if (
      !mapLoaded ||
      !mapRef.current ||
      !selectedGuardFromStore
        ?.location
    ) {
      return
    }

    if (
      !hasValidCoordinates(
        selectedGuardFromStore
          .location.latitude,
        selectedGuardFromStore
          .location.longitude
      )
    ) {
      return
    }

    const map =
      mapRef.current

    const guardPosition = {
      lat: Number(
        selectedGuardFromStore
          .location.latitude
      ),

      lng: Number(
        selectedGuardFromStore
          .location.longitude
      ),
    }

    const geofence =
      selectedGuardFromStore
        .current_assignment
        ?.geofence

    if (
      geofence &&
      hasValidCoordinates(
        geofence.latitude,
        geofence.longitude
      )
    ) {
      const bounds =
        new window.google.maps.LatLngBounds()

      bounds.extend(
        guardPosition
      )

      bounds.extend({
        lat: Number(
          geofence.latitude
        ),

        lng: Number(
          geofence.longitude
        ),
      })

      map.fitBounds(
        bounds,
        {
          top: 120,
          right: 120,
          bottom: 120,
          left: 120,
        }
      )

      const zoom =
        map.getZoom()

      if (
        zoom &&
        zoom > 16
      ) {
        map.setZoom(16)
      }

      return
    }

    map.panTo(
      guardPosition
    )

    map.setZoom(15)
  }, [
    mapLoaded,
    selectedGuardFromStore?.id,
  ])

  useEffect(() => {
    if (
      !mapLoaded ||
      !mapRef.current ||
      hasAutoPositionedRef.current ||
      mappableGuards.length ===
      0
    ) {
      return
    }

    const preferredGuard =
      mappableGuards.find(
        (guard) =>
          guard.online_status ===
          "online"
      ) ??
      mappableGuards.find(
        (guard) =>
          guard.current_assignment
      ) ??
      mappableGuards[0]

    if (
      !preferredGuard?.location
    ) {
      return
    }

    mapRef.current.setCenter(
      {
        lat: Number(
          preferredGuard.location
            .latitude
        ),

        lng: Number(
          preferredGuard.location
            .longitude
        ),
      }
    )

    mapRef.current.setZoom(
      12
    )

    hasAutoPositionedRef.current =
      true
  }, [
    mapLoaded,
    mappableGuards,
  ])

  const selectGuard = (
    guard: LiveGuard
  ) => {
    dispatch(
      setSelectedGuard(
        guard
      )
    )

    setPanelTab(
      "overview"
    )
  }

  const refresh = () => {
    dispatch(
      fetchLiveGuards({
        per_page: 500,
      })
    )
  }

  const centerSelectedGuard =
    () => {
      const location =
        selectedGuardFromStore
          ?.location

      if (
        !location ||
        !mapRef.current
      ) {
        return
      }

      mapRef.current.panTo(
        {
          lat: Number(
            location.latitude
          ),

          lng: Number(
            location.longitude
          ),
        }
      )

      mapRef.current.setZoom(
        16
      )
    }

  const openGoogleMaps = (
    guard: LiveGuard
  ) => {
    if (!guard.location) {
      return
    }

    window.open(
      `https://www.google.com/maps?q=${guard.location.latitude},${guard.location.longitude}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const openHistory =
    async () => {
      if (
        !selectedGuardFromStore
      ) {
        return
      }

      dispatch(
        clearLocationHistory()
      )

      setPanelTab(
        "history"
      )

      await dispatch(
        fetchGuardLocationHistory(
          {
            guardId:
              selectedGuardFromStore.id,

            hours: 24,
          }
        )
      )
    }

  const changePanelTab = (
    value: string
  ) => {
    const tab =
      value as PanelTab

    setPanelTab(tab)

    if (
      tab === "history" &&
      selectedGuardFromStore
    ) {
      dispatch(
        clearLocationHistory()
      )

      dispatch(
        fetchGuardLocationHistory(
          {
            guardId:
              selectedGuardFromStore.id,

            hours: 24,
          }
        )
      )
    }
  }

  const filters: Array<{
    key: GuardFilter
    label: string
    count: number
    dotClass?: string
    icon?: "shield" | "alert" | "moving"
  }> = [
      {
        key: "all",
        label: "All Guards",
        count: totalGuards,
      },

      {
        key: "online",
        label: "Online",
        count: totalOnline,
        dotClass:
          "bg-emerald-500",
      },

      {
        key: "offline",
        label: "Offline",
        count: totalOffline,
        dotClass:
          "bg-slate-500",
      },

      {
        key: "on_duty",
        label: "On Duty",
        count: totalOnDuty,
        icon: "shield",
      },

      {
        key: "outside",
        label: "Outside Geofence",
        count:
          totalOutsideGeofence,
        icon: "alert",
      },

      {
        key: "moving",
        label: "Moving",
        count: totalMoving,
        icon: "moving",
      },
    ]

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f7f8fb]">
      <div className="border-b border-zinc-200 bg-white px-4 py-4 md:px-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a4081f] shadow-sm">
              <LocateFixed className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
                Guard Live Map
              </h1>

              <p className="text-sm text-zinc-500">
                Real-time guard positions, site geofences and operational status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                isConnected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600"
              }
            >
              <span
                className={`mr-2 h-2 w-2 rounded-full ${isConnected
                  ? "bg-emerald-500"
                  : "bg-zinc-400"
                  }`}
              />

              {isConnected
                ? "Live Connected"
                : "Realtime Offline"}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading
                  ? "animate-spin"
                  : ""
                  }`}
              />

              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 md:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(5,minmax(0,1fr))_220px]">
          <MetricCard
            icon={
              <Users className="h-5 w-5" />
            }
            title="Total Guards"
            value={totalGuards}
            iconClass="bg-blue-50 text-blue-700"
          />

          <MetricCard
            icon={
              <span className="h-5 w-5 rounded-full bg-emerald-500 shadow-[0_0_0_7px_rgba(16,185,129,0.12)]" />
            }
            title="Online Now"
            value={totalOnline}
            iconClass="bg-emerald-50 text-emerald-700"
          />

          <MetricCard
            icon={
              <ShieldCheck className="h-5 w-5" />
            }
            title="On Duty"
            value={totalOnDuty}
            iconClass="bg-blue-50 text-blue-700"
          />

          <MetricCard
            icon={
              <AlertTriangle className="h-5 w-5" />
            }
            title="Outside Geofence"
            value={
              totalOutsideGeofence
            }
            iconClass="bg-red-50 text-red-600"
          />

          <MetricCard
            icon={
              <span className="h-5 w-5 rounded-full bg-slate-500" />
            }
            title="Offline"
            value={totalOffline}
            iconClass="bg-slate-100 text-slate-700"
          />

          <Card className="border-zinc-200 shadow-sm">
            <CardContent className="flex h-full items-center justify-between p-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Last Update
                </p>

                <p className="mt-1 text-sm font-semibold text-zinc-950">
                  {lastUpdated
                    ? new Date(
                      lastUpdated
                    ).toLocaleTimeString()
                    : "N/A"}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={refresh}
                disabled={isLoading}
                className="rounded-full"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading
                    ? "animate-spin"
                    : ""
                    }`}
                />
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {filters.map(
                  (item) => {
                    const active =
                      filter ===
                      item.key

                    return (
                      <Button
                        key={
                          item.key
                        }
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setFilter(
                            item.key
                          )
                        }
                        className={
                          active
                            ? "border-[#a4081f] bg-[#a4081f] text-white hover:bg-[#8b071b] hover:text-white"
                            : "bg-white text-zinc-800"
                        }
                      >
                        {item.dotClass && (
                          <span
                            className={`mr-2 h-2.5 w-2.5 rounded-full ${item.dotClass}`}
                          />
                        )}

                        {item.icon ===
                          "shield" && (
                            <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                          )}

                        {item.icon ===
                          "alert" && (
                            <AlertTriangle className="mr-2 h-3.5 w-3.5" />
                          )}

                        {item.icon ===
                          "moving" && (
                            <Navigation className="mr-2 h-3.5 w-3.5" />
                          )}

                        {item.label}

                        <span
                          className={`ml-2 rounded-full px-1.5 text-xs ${active
                            ? "bg-white/20"
                            : "bg-zinc-100"
                            }`}
                        >
                          {item.count}
                        </span>
                      </Button>
                    )
                  }
                )}
              </div>

              <div className="relative w-full xl:w-[360px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <Input
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search guard, ID or site..."
                  className="h-9 bg-white pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid min-h-[720px] gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
          <Card className="relative overflow-hidden border-zinc-200 shadow-sm">
            <div className="absolute left-3 top-3 z-30 rounded-xl border border-zinc-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-700">
                <LegendDot
                  color="bg-emerald-500"
                  label="Online"
                />

                <LegendDot
                  color="bg-red-600"
                  label="Outside Geofence"
                />

                <LegendDot
                  color="bg-slate-500"
                  label="Offline"
                />

                <LegendArrow />

                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-red-600" />
                  Site Location
                </span>
              </div>
            </div>

            {selectedGuardFromStore?.location && (
              <div className="absolute bottom-4 right-3 z-30">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={
                    centerSelectedGuard
                  }
                  className="h-10 w-10 rounded-xl border bg-white shadow-md hover:bg-zinc-50"
                >
                  <Crosshair className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div
              ref={
                mapContainerRef
              }
              className="h-[720px] w-full bg-zinc-100"
            />

            {!mapLoaded &&
              !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-50">
                  <div className="text-center">
                    <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-zinc-500" />

                    <p className="text-sm text-zinc-500">
                      Loading live map...
                    </p>
                  </div>
                </div>
              )}

            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                <div className="max-w-sm p-6 text-center">
                  <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />

                  <p className="font-medium text-red-700">
                    Map unavailable
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {mapError}
                  </p>
                </div>
              </div>
            )}

            {mapLoaded &&
              mappableGuards.length ===
              0 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
                  <div className="rounded-lg border bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm">
                    No guards with usable GPS match this filter.
                  </div>
                </div>
              )}
          </Card>

          <Card className="overflow-hidden border-zinc-200 shadow-sm">
            <CardContent className="h-full p-0">
              {selectedGuardFromStore ? (
                <SelectedGuardPanel
                  guard={
                    selectedGuardFromStore
                  }
                  panelTab={
                    panelTab
                  }
                  onTabChange={
                    changePanelTab
                  }
                  onViewHistory={
                    openHistory
                  }
                  onOpenGoogleMaps={
                    openGoogleMaps
                  }
                  history={
                    locationHistory
                  }
                  historyTotal={
                    historyTotalPoints
                  }
                  historyLoading={
                    isLoading &&
                    panelTab ===
                    "history"
                  }
                />
              ) : (
                <div className="flex h-full min-h-[560px] flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
                    <MapPin className="h-6 w-6 text-zinc-500" />
                  </div>

                  <h3 className="font-semibold text-zinc-900">
                    Select a guard
                  </h3>

                  <p className="mt-2 max-w-[260px] text-sm leading-6 text-zinc-500">
                    Click a guard profile marker on the map to view live status, assignment and geofence details.
                  </p>

                  {mappableGuards.length >
                    0 && (
                      <div className="mt-5 flex max-h-[250px] w-full flex-col gap-2 overflow-y-auto">
                        {mappableGuards
                          .slice(0, 8)
                          .map(
                            (
                              guard
                            ) => (
                              <button
                                key={
                                  guard.id
                                }
                                type="button"
                                onClick={() =>
                                  selectGuard(
                                    guard
                                  )
                                }
                                className="flex items-center gap-3 rounded-xl border bg-white p-2.5 text-left transition hover:border-zinc-300 hover:bg-zinc-50"
                              >
                                <img
                                  src={getAvatarSrc(
                                    guard.profile_image
                                  )}
                                  alt=""
                                  className="h-9 w-9 rounded-full object-cover"
                                  onError={(
                                    event
                                  ) => {
                                    event.currentTarget.src =
                                      "/images/avatar.png"
                                  }}
                                />

                                <div className="min-w-0">
                                  <div className="truncate text-sm font-semibold text-zinc-900">
                                    {
                                      guard.full_name
                                    }
                                  </div>

                                  <div className="truncate text-xs text-zinc-500">
                                    {
                                      guard.guard_code
                                    }
                                  </div>
                                </div>
                              </button>
                            )
                          )}
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  title,
  value,
  iconClass,
}: {
  icon: ReactNode
  title: string
  value: number
  iconClass: string
}) {
  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-2xl font-semibold leading-none text-zinc-950">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-zinc-500">
            {title}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function LegendDot({
  color,
  label,
}: {
  color: string
  label: string
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`h-2.5 w-2.5 rounded-full ${color}`}
      />

      {label}
    </span>
  )
}

function LegendArrow() {
  return (
    <span className="flex items-center gap-1.5">
      <Navigation className="h-3.5 w-3.5 rotate-45 fill-violet-600 text-violet-600" />
      Moving
    </span>
  )
}

function SelectedGuardPanel({
  guard,
  panelTab,
  onTabChange,
  onViewHistory,
  onOpenGoogleMaps,
  history,
  historyTotal,
  historyLoading,
}: {
  guard: LiveGuard
  panelTab: PanelTab
  onTabChange: (
    value: string
  ) => void
  onViewHistory: () => void
  onOpenGoogleMaps: (
    guard: LiveGuard
  ) => void
  history: LocationHistoryPoint[]
  historyTotal: number
  historyLoading: boolean
}) {
  const location =
    guard.location

  const assignment =
    guard.current_assignment

  const device =
    guard.device_info

  const outside =
    Boolean(
      assignment &&
      location &&
      location.duty_location_match ===
      false
    )

  const avatar =
    getAvatarSrc(
      guard.profile_image
    )

  return (
    <div className="flex h-full min-h-[720px] flex-col bg-white">
      <div className="border-b px-5 pb-4 pt-5">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <img
              src={avatar}
              alt={guard.full_name}
              className={`h-14 w-14 rounded-full border-2 object-cover ${outside
                ? "border-red-500"
                : guard.online_status ===
                  "online"
                  ? "border-emerald-500"
                  : "border-slate-400"
                }`}
              onError={(
                event
              ) => {
                event.currentTarget.src =
                  "/images/avatar.png"
              }}
            />

            <span
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${guard.online_status ===
                "online"
                ? "bg-emerald-500"
                : "bg-slate-500"
                }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-zinc-950">
              {guard.full_name}
            </h2>

            <p className="mt-0.5 text-sm text-zinc-500">
              {guard.guard_code}
            </p>
          </div>

          <Badge
            className={
              guard.online_status ===
                "online"
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-700 hover:bg-slate-100"
            }
          >
            <span
              className={`mr-1.5 h-2 w-2 rounded-full ${guard.online_status ===
                "online"
                ? "bg-emerald-500"
                : "bg-slate-500"
                }`}
            />

            {guard.online_status}
          </Badge>
        </div>
      </div>

      <Tabs
        value={panelTab}
        onValueChange={
          onTabChange
        }
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="border-b px-4">
          <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-[#a4081f] data-[state=active]:bg-transparent data-[state=active]:text-[#a4081f] data-[state=active]:shadow-none"
            >
              Overview
            </TabsTrigger>

            <TabsTrigger
              value="live"
              className="rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-[#a4081f] data-[state=active]:bg-transparent data-[state=active]:text-[#a4081f] data-[state=active]:shadow-none"
            >
              Live Info
            </TabsTrigger>

            <TabsTrigger
              value="assignment"
              className="rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-[#a4081f] data-[state=active]:bg-transparent data-[state=active]:text-[#a4081f] data-[state=active]:shadow-none"
            >
              Assignment
            </TabsTrigger>

            <TabsTrigger
              value="history"
              className="rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-[#a4081f] data-[state=active]:bg-transparent data-[state=active]:text-[#a4081f] data-[state=active]:shadow-none"
            >
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <TabsContent
            value="overview"
            className="m-0 space-y-3 p-4"
          >
            <InfoBox>
              <InfoBoxHeader
                icon={
                  <MapPin className="h-4 w-4 text-blue-600" />
                }
                title="Current Location"
              />

              {location ? (
                <div className="mt-3 flex gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900">
                      {Number(
                        location.latitude
                      ).toFixed(5)}
                      ,{" "}
                      {Number(
                        location.longitude
                      ).toFixed(5)}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      {assignment
                        ?.site_address ??
                        assignment
                          ?.site_name ??
                        "Live GPS position"}
                    </p>
                  </div>

                  <div className="border-l pl-3 text-right">
                    <LocateFixed className="ml-auto h-4 w-4 text-slate-500" />

                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      {location.accuracy ??
                        "N/A"}{" "}
                      m
                    </p>

                    <p className="text-[10px] text-zinc-400">
                      Accuracy
                    </p>
                  </div>
                </div>
              ) : (
                <EmptyText text="No GPS data available." />
              )}
            </InfoBox>

            <InfoBox>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Building2 className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-900">
                    Assigned Site
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-zinc-950">
                    {assignment
                      ?.site_name ??
                      "No active site"}
                  </p>

                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {assignment
                      ?.site_location
                      ?.name ??
                      assignment
                        ?.site_address ??
                      "No site location"}
                  </p>
                </div>

                <div className="text-right">
                  <div className="mx-auto h-7 w-7 rounded-full border-2 border-dashed border-red-500" />

                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {assignment
                      ? formatDistance(
                        assignment.allowed_radius_meters
                      )
                      : "N/A"}
                  </p>

                  <p className="text-[10px] text-zinc-400">
                    Allowed Radius
                  </p>
                </div>
              </div>
            </InfoBox>

            <div className="grid grid-cols-2 gap-3">
              <InfoBox>
                <InfoBoxHeader
                  icon={
                    <AlertTriangle
                      className={`h-4 w-4 ${outside
                        ? "text-red-600"
                        : "text-emerald-600"
                        }`}
                    />
                  }
                  title="Distance from Post"
                />

                <p
                  className={`mt-3 text-xl font-semibold ${outside
                    ? "text-red-600"
                    : "text-emerald-600"
                    }`}
                >
                  {formatDistance(
                    location
                      ?.distance_from_duty_meters
                  )}
                </p>
              </InfoBox>

              <InfoBox>
                <InfoBoxHeader
                  icon={
                    <LocateFixed
                      className={`h-4 w-4 ${outside
                        ? "text-red-600"
                        : "text-emerald-600"
                        }`}
                    />
                  }
                  title="Geofence Status"
                />

                <p
                  className={`mt-3 text-lg font-semibold uppercase ${outside
                    ? "text-red-600"
                    : assignment &&
                      location
                      ? "text-emerald-600"
                      : "text-zinc-500"
                    }`}
                >
                  {assignment &&
                    location
                    ? outside
                      ? "Outside"
                      : "Inside"
                    : "N/A"}
                </p>
              </InfoBox>
            </div>

            <InfoBox>
              <div className="grid grid-cols-3 divide-x">
                <LiveMiniStat
                  icon={
                    <Navigation className="h-4 w-4 text-slate-500" />
                  }
                  label="Speed"
                  value={`${formatSpeed(
                    location?.speed
                  )} m/s`}
                />

                <LiveMiniStat
                  icon={
                    <Battery className="h-4 w-4 text-emerald-500" />
                  }
                  label="Battery"
                  value={formatBattery(
                    device?.battery_level
                  )}
                />

                <LiveMiniStat
                  icon={
                    device?.network_type ===
                      "wifi" ? (
                      <Wifi className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Signal className="h-4 w-4 text-blue-600" />
                    )
                  }
                  label="Network"
                  value={
                    device?.network_type ??
                    "N/A"
                  }
                />
              </div>
            </InfoBox>

            <InfoBox>
              <InfoBoxHeader
                icon={
                  <Clock3 className="h-4 w-4 text-slate-500" />
                }
                title="Last GPS Update"
              />

              <p className="mt-2 text-sm font-semibold text-zinc-900">
                {location?.updated_ago ??
                  "N/A"}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {formatDateTime(
                  location?.updated_at
                )}
              </p>
            </InfoBox>
          </TabsContent>

          <TabsContent
            value="live"
            className="m-0 space-y-3 p-4"
          >
            <InfoBox>
              <InfoBoxHeader
                icon={
                  <LocateFixed className="h-4 w-4 text-blue-600" />
                }
                title="GPS Details"
              />

              <DetailRows
                rows={[
                  [
                    "Latitude",
                    location
                      ?.latitude ??
                    "N/A",
                  ],
                  [
                    "Longitude",
                    location
                      ?.longitude ??
                    "N/A",
                  ],
                  [
                    "Accuracy",
                    location?.accuracy !==
                      null &&
                      location?.accuracy !==
                      undefined
                      ? `${location.accuracy} m`
                      : "N/A",
                  ],
                  [
                    "Movement",
                    location?.is_moving
                      ? "Moving"
                      : "Stationary",
                  ],
                  [
                    "Speed",
                    `${formatSpeed(
                      location?.speed
                    )} m/s`,
                  ],
                ]}
              />
            </InfoBox>

            <InfoBox>
              <InfoBoxHeader
                icon={
                  <Battery className="h-4 w-4 text-emerald-600" />
                }
                title="Device Status"
              />

              <DetailRows
                rows={[
                  [
                    "Battery",
                    formatBattery(
                      device?.battery_level
                    ),
                  ],
                  [
                    "Charging",
                    device?.is_charging
                      ? "Yes"
                      : "No",
                  ],
                  [
                    "Network",
                    device?.network_type ??
                    "N/A",
                  ],
                  [
                    "App Version",
                    device?.app_version ??
                    "N/A",
                  ],
                ]}
              />
            </InfoBox>

            <InfoBox>
              <InfoBoxHeader
                icon={
                  <Clock3 className="h-4 w-4 text-slate-600" />
                }
                title="Activity"
              />

              <DetailRows
                rows={[
                  [
                    "Last GPS",
                    location?.updated_ago ??
                    "N/A",
                  ],
                  [
                    "Last Ping",
                    formatDateTime(
                      guard.last_ping_at
                    ),
                  ],
                  [
                    "Last Activity",
                    formatDateTime(
                      guard.last_activity_at
                    ),
                  ],
                ]}
              />
            </InfoBox>
          </TabsContent>

          <TabsContent
            value="assignment"
            className="m-0 space-y-3 p-4"
          >
            <InfoBox>
              <InfoBoxHeader
                icon={
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                }
                title="Current Assignment"
              />

              <DetailRows
                rows={[
                  [
                    "Duty",
                    assignment
                      ?.duty_title ??
                    assignment
                      ?.title ??
                    "N/A",
                  ],
                  [
                    "Service Mode",
                    assignment
                      ?.service_mode ??
                    "N/A",
                  ],
                  [
                    "Site",
                    assignment
                      ?.site_name ??
                    "N/A",
                  ],
                  [
                    "Site Location",
                    assignment
                      ?.site_location
                      ?.name ??
                    assignment
                      ?.site_address ??
                    "N/A",
                  ],
                  [
                    "Allowed Radius",
                    assignment
                      ? formatDistance(
                        assignment.allowed_radius_meters
                      )
                      : "N/A",
                  ],
                  [
                    "Start",
                    formatDateTime(
                      assignment
                        ?.start_time
                    ),
                  ],
                  [
                    "End",
                    formatDateTime(
                      assignment
                        ?.end_time
                    ),
                  ],
                ]}
              />
            </InfoBox>

            {assignment?.geofence && (
              <InfoBox>
                <InfoBoxHeader
                  icon={
                    <MapPin className="h-4 w-4 text-red-600" />
                  }
                  title="Geofence Center"
                />

                <DetailRows
                  rows={[
                    [
                      "Latitude",
                      assignment
                        .geofence
                        .latitude ??
                      "N/A",
                    ],
                    [
                      "Longitude",
                      assignment
                        .geofence
                        .longitude ??
                      "N/A",
                    ],
                    [
                      "Source",
                      assignment
                        .geofence
                        .source ??
                      "N/A",
                    ],
                    [
                      "Radius",
                      formatDistance(
                        assignment
                          .geofence
                          .radius_meters
                      ),
                    ],
                  ]}
                />
              </InfoBox>
            )}
          </TabsContent>

          <TabsContent
            value="history"
            className="m-0 p-4"
          >
            <InfoBox>
              <div className="flex items-center justify-between gap-3">
                <InfoBoxHeader
                  icon={
                    <History className="h-4 w-4 text-violet-600" />
                  }
                  title="24 Hour History"
                />

                <Badge
                  variant="secondary"
                  className="text-[10px]"
                >
                  {historyTotal} points
                </Badge>
              </div>

              {historyLoading ? (
                <div className="flex justify-center py-10">
                  <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
                </div>
              ) : history.length >
                0 ? (
                <div className="mt-4 space-y-2">
                  {history
                    .slice()
                    .reverse()
                    .slice(0, 25)
                    .map(
                      (
                        point,
                        index
                      ) => (
                        <HistoryPoint
                          key={`${point.time}-${index}`}
                          point={
                            point
                          }
                          latest={
                            index ===
                            0
                          }
                        />
                      )
                    )}
                </div>
              ) : (
                <EmptyText text="No location history available for the last 24 hours." />
              )}
            </InfoBox>
          </TabsContent>
        </div>
      </Tabs>

      <div className="grid grid-cols-2 gap-2 border-t p-4">
        <Button
          className="bg-[#a4081f] text-white hover:bg-[#8b071b]"
          onClick={
            onViewHistory
          }
        >
          <History className="mr-2 h-4 w-4" />

          View History
        </Button>

        <Button
          variant="outline"
          disabled={!location}
          onClick={() =>
            onOpenGoogleMaps(
              guard
            )
          }
        >
          <ExternalLink className="mr-2 h-4 w-4" />

          Google Maps
        </Button>
      </div>
    </div>
  )
}

function InfoBox({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {children}
    </div>
  )
}

function InfoBoxHeader({
  icon,
  title,
}: {
  icon: ReactNode
  title: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-50">
        {icon}
      </div>

      <p className="text-xs font-semibold text-zinc-900">
        {title}
      </p>
    </div>
  )
}

function LiveMiniStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <div className="flex items-center gap-1.5">
        {icon}

        <span className="text-[10px] text-zinc-500">
          {label}
        </span>
      </div>

      <p className="mt-1 text-xs font-semibold text-zinc-900">
        {value}
      </p>
    </div>
  )
}

function DetailRows({
  rows,
}: {
  rows: Array<
    [
      string,
      string | number
    ]
  >
}) {
  return (
    <div className="mt-3 divide-y divide-zinc-100">
      {rows.map(
        ([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4 py-2.5"
          >
            <span className="text-xs text-zinc-500">
              {label}
            </span>

            <span className="max-w-[210px] break-words text-right text-xs font-semibold text-zinc-900">
              {value}
            </span>
          </div>
        )
      )}
    </div>
  )
}

function EmptyText({
  text,
}: {
  text: string
}) {
  return (
    <p className="mt-3 text-sm leading-6 text-zinc-500">
      {text}
    </p>
  )
}

function HistoryPoint({
  point,
  latest,
}: {
  point: LocationHistoryPoint
  latest: boolean
}) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${point.duty_location_match
              ? "bg-emerald-500"
              : "bg-red-500"
              }`}
          />

          <span className="text-xs font-semibold text-zinc-900">
            {point.formatted_time}
          </span>
        </div>

        {latest && (
          <Badge
            variant="secondary"
            className="text-[10px]"
          >
            Latest
          </Badge>
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-zinc-500">
        <span>
          {Number(
            point.latitude
          ).toFixed(5)}
        </span>

        <span className="text-right">
          {Number(
            point.longitude
          ).toFixed(5)}
        </span>

        <span>
          {formatDistance(
            point.distance_from_duty_meters
          )}
        </span>

        <span className="text-right">
          {point.duty_location_match
            ? "Inside"
            : "Outside"}
        </span>
      </div>
    </div>
  )
}
