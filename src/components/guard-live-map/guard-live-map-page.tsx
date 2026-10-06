"use client"

import {
  Battery,
  CircleAlert,
  ExternalLink,
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

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"

import {
  fetchLiveGuards,
  setSelectedGuard,
} from "@/store/slices/liveTrackingSlice"

import {
  LiveGuard,
} from "@/app/types/liveTracking"

import { useSocket } from "@/components/contexts/SocketContext"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type GuardFilter =
  | "all"
  | "online"
  | "offline"
  | "on_duty"
  | "outside"
  | "moving"

declare global {
  interface Window {
    google: typeof google
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const hasValidCoordinates = (
  latitude: string | number | null | undefined,
  longitude: string | number | null | undefined
) => {
  const lat = Number(latitude)
  const lng = Number(longitude)

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  )
}

const formatDistance = (
  value: string | number | null | undefined
) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "Not available"
  }

  const meters = Number(value)

  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`
  }

  return `${Math.round(meters)} m`
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

const getMarkerColor = (
  guard: LiveGuard,
  selected: boolean
) => {
  if (selected) {
    return "#2563eb"
  }

  if (guard.online_status !== "online") {
    return "#52525b"
  }

  if (
    guard.current_assignment &&
    guard.location?.duty_location_match === false
  ) {
    return "#dc2626"
  }

  return "#16a34a"
}

const buildMarkerIcon = (
  color: string,
  selected: boolean
): google.maps.Symbol => ({
  path: google.maps.SymbolPath.CIRCLE,
  fillColor: color,
  fillOpacity: 1,
  strokeColor: "#ffffff",
  strokeWeight: selected ? 4 : 3,
  scale: selected ? 11 : 9,
})

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function GuardCommandMapPage() {
  const dispatch = useAppDispatch()

  const {
    guards,
    totalOnline,
    totalOffline,
    totalGuards,
    totalOnDuty,
    totalMoving,
    totalOutsideGeofence,
    lastUpdated,
    isLoading,
    error,
    selectedGuard,
  } = useAppSelector(
    (state) => state.liveTracking
  )

  const { isConnected } = useSocket()

  const [filter, setFilter] =
    useState<GuardFilter>("all")

  const [search, setSearch] =
    useState("")

  const [mapLoaded, setMapLoaded] =
    useState(false)

  const [mapError, setMapError] =
    useState<string | null>(null)

  const mapContainerRef =
    useRef<HTMLDivElement | null>(null)

  const mapRef =
    useRef<google.maps.Map | null>(null)

  const markersRef = useRef<
    Map<number, google.maps.Marker>
  >(new Map())

  const circlesRef = useRef<
    Map<string, google.maps.Circle>
  >(new Map())

  const infoWindowRef =
    useRef<google.maps.InfoWindow | null>(
      null
    )

  /* ------------------------------------------------------------------------ */
  /* Initial API load                                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    dispatch(
      fetchLiveGuards({
        per_page: 500,
      })
    )
  }, [dispatch])

  /* ------------------------------------------------------------------------ */
  /* Load Google Maps                                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return
    }

    if (window.google?.maps) {
      setMapLoaded(true)
      return
    }

    const existingScript =
      document.getElementById(
        "google-maps-script"
      ) as HTMLScriptElement | null

    if (existingScript) {
      const handleLoad = () =>
        setMapLoaded(true)

      const handleError = () =>
        setMapError(
          "Failed to load Google Maps."
        )

      existingScript.addEventListener(
        "load",
        handleLoad
      )

      existingScript.addEventListener(
        "error",
        handleError
      )

      return () => {
        existingScript.removeEventListener(
          "load",
          handleLoad
        )

        existingScript.removeEventListener(
          "error",
          handleError
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
      document.createElement("script")

    script.id = "google-maps-script"

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

    document.head.appendChild(script)
  }, [])

  /* ------------------------------------------------------------------------ */
  /* Filter Guards                                                           */
  /* ------------------------------------------------------------------------ */

  const filteredGuards =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase()

      return guards.filter((guard) => {
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
              guard.location?.is_moving ===
              true
            )

          default:
            return true
        }
      })
    }, [guards, filter, search])

  const mappableGuards =
    useMemo(() => {
      return filteredGuards.filter(
        (guard) =>
          guard.location &&
          hasValidCoordinates(
            guard.location.latitude,
            guard.location.longitude
          )
      )
    }, [filteredGuards])

  /* ------------------------------------------------------------------------ */
  /* Initialize Map                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !mapLoaded ||
      !mapContainerRef.current ||
      !window.google?.maps
    ) {
      return
    }

    if (!mapRef.current) {
      mapRef.current =
        new window.google.maps.Map(
          mapContainerRef.current,
          {
            center: {
              lat: 34.5553,
              lng: 69.2075,
            },

            zoom: 5,

            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,

            gestureHandling: "greedy",
          }
        )

      infoWindowRef.current =
        new window.google.maps.InfoWindow()
    }
  }, [mapLoaded])

  /* ------------------------------------------------------------------------ */
  /* Guard Markers                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !mapLoaded ||
      !mapRef.current ||
      !window.google?.maps
    ) {
      return
    }

    const map = mapRef.current

    const visibleGuardIds =
      new Set<number>()

    mappableGuards.forEach(
      (guard) => {
        if (!guard.location) {
          return
        }

        const lat =
          Number(
            guard.location.latitude
          )

        const lng =
          Number(
            guard.location.longitude
          )

        const position = {
          lat,
          lng,
        }

        visibleGuardIds.add(
          guard.id
        )

        const selected =
          selectedGuard?.id ===
          guard.id

        const markerColor =
          getMarkerColor(
            guard,
            selected
          )

        let marker =
          markersRef.current.get(
            guard.id
          )

        if (!marker) {
          marker =
            new window.google.maps.Marker(
              {
                map,
                position,

                title:
                  guard.full_name,

                icon:
                  buildMarkerIcon(
                    markerColor,
                    selected
                  ),

                zIndex:
                  selected
                    ? 1000
                    : guard.online_status ===
                      "online"
                      ? 500
                      : 100,
              }
            )

          marker.addListener(
            "click",
            () => {
              dispatch(
                setSelectedGuard(
                  guard
                )
              )

              const location =
                guard.location

              const assignment =
                guard.current_assignment

              const content = `
                <div style="min-width:220px;padding:6px;font-family:Arial,sans-serif">
                  <div style="font-size:15px;font-weight:700;margin-bottom:4px">
                    ${guard.full_name}
                  </div>

                  <div style="font-size:12px;color:#52525b;margin-bottom:8px">
                    ${guard.guard_code}
                  </div>

                  <div style="font-size:12px;margin-bottom:4px">
                    <strong>Status:</strong>
                    ${guard.online_status}
                  </div>

                  <div style="font-size:12px;margin-bottom:4px">
                    <strong>Site:</strong>
                    ${assignment?.site_name ?? "No active site"}
                  </div>

                  <div style="font-size:12px;margin-bottom:4px">
                    <strong>Distance:</strong>
                    ${formatDistance(location?.distance_from_duty_meters)}
                  </div>

                  <div style="font-size:12px">
                    <strong>Last GPS:</strong>
                    ${location?.updated_ago ?? "Unknown"}
                  </div>
                </div>
              `

              infoWindowRef.current?.setContent(
                content
              )

              infoWindowRef.current?.open(
                map,
                marker
              )
            }
          )

          markersRef.current.set(
            guard.id,
            marker
          )
        } else {
          marker.setMap(map)
          marker.setPosition(
            position
          )

          marker.setIcon(
            buildMarkerIcon(
              markerColor,
              selected
            )
          )

          marker.setZIndex(
            selected
              ? 1000
              : guard.online_status ===
                "online"
                ? 500
                : 100
          )
        }
      }
    )

    markersRef.current.forEach(
      (marker, guardId) => {
        if (
          !visibleGuardIds.has(
            guardId
          )
        ) {
          marker.setMap(null)
        }
      }
    )
  }, [
    dispatch,
    mapLoaded,
    mappableGuards,
    selectedGuard?.id,
  ])

  /* ------------------------------------------------------------------------ */
  /* Site Geofence Circles                                                   */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !mapLoaded ||
      !mapRef.current ||
      !window.google?.maps
    ) {
      return
    }

    const map = mapRef.current

    const visibleCircleKeys =
      new Set<string>()

    filteredGuards.forEach(
      (guard) => {
        const assignment =
          guard.current_assignment

        const geofence =
          assignment?.geofence

        if (
          !assignment ||
          !geofence
        ) {
          return
        }

        if (
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
          !Number.isFinite(radius) ||
          radius <= 0
        ) {
          return
        }

        const circleKey =
          assignment.site_location_id
            ? `location-${assignment.site_location_id}`
            : `site-${assignment.site_id}`

        visibleCircleKeys.add(
          circleKey
        )

        const center = {
          lat: Number(
            geofence.latitude
          ),
          lng: Number(
            geofence.longitude
          ),
        }

        let circle =
          circlesRef.current.get(
            circleKey
          )

        if (!circle) {
          circle =
            new window.google.maps.Circle(
              {
                map,

                center,

                radius,

                strokeColor:
                  "#dc2626",

                strokeOpacity:
                  0.9,

                strokeWeight: 2,

                fillColor:
                  "#ef4444",

                fillOpacity:
                  0.12,

                clickable: false,

                zIndex: 10,
              }
            )

          circlesRef.current.set(
            circleKey,
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
      }
    )

    circlesRef.current.forEach(
      (circle, key) => {
        if (
          !visibleCircleKeys.has(
            key
          )
        ) {
          circle.setMap(null)
        }
      }
    )
  }, [
    filteredGuards,
    mapLoaded,
  ])

  /* ------------------------------------------------------------------------ */
  /* Initial Fit                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !mapLoaded ||
      !mapRef.current ||
      !window.google?.maps ||
      mappableGuards.length === 0
    ) {
      return
    }

    const bounds =
      new window.google.maps.LatLngBounds()

    mappableGuards.forEach(
      (guard) => {
        if (!guard.location) {
          return
        }

        bounds.extend({
          lat: Number(
            guard.location.latitude
          ),
          lng: Number(
            guard.location.longitude
          ),
        })
      }
    )

    if (
      mappableGuards.length === 1
    ) {
      mapRef.current.setCenter(
        bounds.getCenter()
      )

      mapRef.current.setZoom(15)

      return
    }

    mapRef.current.fitBounds(
      bounds,
      70
    )
  }, [
    mapLoaded,
    filter,
    search,
  ])

  /* ------------------------------------------------------------------------ */
  /* Selected Guard Focus                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !selectedGuard?.location ||
      !mapRef.current
    ) {
      return
    }

    if (
      !hasValidCoordinates(
        selectedGuard.location
          .latitude,
        selectedGuard.location
          .longitude
      )
    ) {
      return
    }

    mapRef.current.panTo({
      lat: Number(
        selectedGuard.location
          .latitude
      ),

      lng: Number(
        selectedGuard.location
          .longitude
      ),
    })

    mapRef.current.setZoom(
      16
    )
  }, [
    selectedGuard?.id,
  ])

  /* ------------------------------------------------------------------------ */
  /* Actions                                                                  */
  /* ------------------------------------------------------------------------ */

  const refresh = () => {
    dispatch(
      fetchLiveGuards({
        per_page: 500,
      })
    )
  }

  const openGoogleMaps = (
    guard: LiveGuard
  ) => {
    if (!guard.location) {
      return
    }

    const lat =
      guard.location.latitude

    const lng =
      guard.location.longitude

    window.open(
      `https://www.google.com/maps?q=${lat},${lng}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                  */
  /* ------------------------------------------------------------------------ */

  const filters: Array<{
    key: GuardFilter
    label: string
    count: number
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
      },

      {
        key: "offline",
        label: "Offline",
        count: totalOffline,
      },

      {
        key: "on_duty",
        label: "On Duty",
        count: totalOnDuty,
      },

      {
        key: "outside",
        label: "Outside Geofence",
        count:
          totalOutsideGeofence,
      },

      {
        key: "moving",
        label: "Moving",
        count: totalMoving,
      },
    ]

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-50">
      <div className="border-b bg-white px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950">
                <LocateFixed className="h-5 w-5 text-white" />
              </div>

              <div>
                <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
                  Guard Live Map
                </h1>

                <p className="text-sm text-zinc-500">
                  Company-wide realtime guard positioning and geofence monitoring
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={
                isConnected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600"
              }
            >
              <span
                className={
                  `mr-2 h-2 w-2 rounded-full ${isConnected
                    ? "bg-emerald-500"
                    : "bg-zinc-400"
                  }`
                }
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
                className={
                  `mr-2 h-4 w-4 ${isLoading
                    ? "animate-spin"
                    : ""
                  }`
                }
              />

              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 md:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <SummaryCard
            title="Total Guards"
            value={totalGuards}
            icon={<Users />}
          />

          <SummaryCard
            title="Online Now"
            value={totalOnline}
            icon={<UserCheck />}
          />

          <SummaryCard
            title="On Duty"
            value={totalOnDuty}
            icon={<ShieldCheck />}
          />

          <SummaryCard
            title="Outside Geofence"
            value={
              totalOutsideGeofence
            }
            icon={<CircleAlert />}
          />

          <SummaryCard
            title="Offline"
            value={totalOffline}
            icon={<UserX />}
          />

          <SummaryCard
            title="Moving"
            value={totalMoving}
            icon={<Navigation />}
          />
        </div>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {filters.map(
                  (item) => (
                    <Button
                      key={item.key}
                      size="sm"
                      variant={
                        filter ===
                          item.key
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        setFilter(
                          item.key
                        )
                      }
                    >
                      {item.label}

                      <span className="ml-2 rounded-full bg-black/10 px-1.5 text-xs">
                        {item.count}
                      </span>
                    </Button>
                  )
                )}
              </div>

              <div className="relative w-full xl:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search guard, ID or site..."
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid min-h-[680px] gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="relative overflow-hidden border-zinc-200 shadow-sm">
            <div className="absolute left-3 top-3 z-10 rounded-lg border bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
              <div className="flex flex-wrap items-center gap-3">
                <LegendDot
                  color="bg-green-600"
                  label="Online"
                />

                <LegendDot
                  color="bg-red-600"
                  label="Outside"
                />

                <LegendDot
                  color="bg-zinc-600"
                  label="Offline"
                />

                <LegendDot
                  color="bg-blue-600"
                  label="Selected"
                />
              </div>
            </div>

            <div
              ref={mapContainerRef}
              className="h-[680px] w-full bg-zinc-100"
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
                  <CircleAlert className="mx-auto mb-3 h-8 w-8 text-red-500" />

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
                    No guards with GPS coordinates match this filter.
                  </div>
                </div>
              )}
          </Card>

          <Card className="border-zinc-200 shadow-sm">
            <CardContent className="h-full p-0">
              {selectedGuard ? (
                <GuardPanel
                  guard={
                    selectedGuard
                  }
                  openGoogleMaps={
                    openGoogleMaps
                  }
                />
              ) : (
                <div className="flex h-full min-h-[500px] flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
                    <MapPin className="h-6 w-6 text-zinc-500" />
                  </div>

                  <h3 className="font-semibold text-zinc-900">
                    Select a guard
                  </h3>

                  <p className="mt-2 max-w-[240px] text-sm text-zinc-500">
                    Click any guard marker on the map to view live GPS, assignment and geofence information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
          <span>
            Showing{" "}
            {mappableGuards.length}{" "}
            guards with usable GPS
          </span>

          <span>
            Last API update:{" "}
            {lastUpdated
              ? new Date(
                lastUpdated
              ).toLocaleString()
              : "Not available"}
          </span>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-medium text-zinc-500">
            {title}
          </p>

          <p className="mt-1 text-2xl font-semibold text-zinc-950">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 [&>svg]:h-4 [&>svg]:w-4">
          {icon}
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

function GuardPanel({
  guard,
  openGoogleMaps,
}: {
  guard: LiveGuard
  openGoogleMaps: (
    guard: LiveGuard
  ) => void
}) {
  const assignment =
    guard.current_assignment

  const location =
    guard.location

  const device =
    guard.device_info

  const inside =
    location?.duty_location_match

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">
              {guard.full_name}
            </h2>

            <p className="text-sm text-zinc-500">
              {guard.guard_code}
            </p>
          </div>

          <Badge
            className={
              guard.online_status ===
                "online"
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-100"
            }
          >
            {guard.online_status}
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <PanelSection title="Current Location">
          {location ? (
            <>
              <PanelRow
                label="Latitude"
                value={
                  location.latitude
                }
              />

              <PanelRow
                label="Longitude"
                value={
                  location.longitude
                }
              />

              <PanelRow
                label="Accuracy"
                value={
                  location.accuracy !==
                    null &&
                    location.accuracy !==
                    undefined
                    ? `${location.accuracy} m`
                    : "N/A"
                }
              />

              <PanelRow
                label="Last GPS"
                value={
                  location.updated_ago ??
                  "N/A"
                }
              />
            </>
          ) : (
            <p className="text-sm text-zinc-500">
              No GPS data available.
            </p>
          )}
        </PanelSection>

        <PanelSection title="Assignment">
          <PanelRow
            label="Duty"
            value={
              assignment?.duty_title ??
              assignment?.title ??
              "No active duty"
            }
          />

          <PanelRow
            label="Site"
            value={
              assignment?.site_name ??
              "Not assigned"
            }
          />

          <PanelRow
            label="Service Mode"
            value={
              assignment?.service_mode ??
              "N/A"
            }
          />

          <PanelRow
            label="Allowed Radius"
            value={
              assignment
                ?.allowed_radius_meters
                ? formatDistance(
                  assignment.allowed_radius_meters
                )
                : "N/A"
            }
          />
        </PanelSection>

        <PanelSection title="Geofence">
          <PanelRow
            label="Distance from Post"
            value={formatDistance(
              location?.distance_from_duty_meters
            )}
          />

          <div className="flex items-center justify-between gap-3 py-1.5">
            <span className="text-sm text-zinc-500">
              Status
            </span>

            {assignment &&
              location ? (
              <Badge
                className={
                  inside
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                    : "bg-red-100 text-red-700 hover:bg-red-100"
                }
              >
                {inside
                  ? "Inside Geofence"
                  : "Outside Geofence"}
              </Badge>
            ) : (
              <span className="text-sm font-medium text-zinc-900">
                N/A
              </span>
            )}
          </div>
        </PanelSection>

        <PanelSection title="Live Information">
          <PanelRow
            label="Movement"
            value={
              location?.is_moving
                ? "Moving"
                : "Stationary"
            }
          />

          <PanelRow
            label="Speed"
            value={`${formatSpeed(
              location?.speed
            )} m/s`}
            icon={<Navigation />}
          />

          <PanelRow
            label="Battery"
            value={formatBattery(
              device?.battery_level
            )}
            icon={<Battery />}
          />

          <PanelRow
            label="Network"
            value={
              device?.network_type ??
              "N/A"
            }
            icon={
              device?.network_type ===
                "wifi" ? (
                <Wifi />
              ) : (
                <Signal />
              )
            }
          />
        </PanelSection>
      </div>

      <div className="border-t p-4">
        <Button
          className="w-full"
          variant="outline"
          disabled={!location}
          onClick={() =>
            openGoogleMaps(guard)
          }
        >
          <ExternalLink className="mr-2 h-4 w-4" />

          Open in Google Maps
        </Button>
      </div>
    </div>
  )
}

function PanelSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {title}
      </h3>

      <div className="divide-y divide-zinc-100">
        {children}
      </div>
    </div>
  )
}

function PanelRow({
  label,
  value,
  icon,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-zinc-500">
        {label}
      </span>

      <span className="flex max-w-[180px] items-center gap-1.5 text-right text-sm font-medium text-zinc-900 [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}

        {value}
      </span>
    </div>
  )
}