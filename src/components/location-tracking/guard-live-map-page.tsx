// components/guard/guard-live-map-page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    MapPin,
    Clock,
    AlertCircle,
    Eye,
    List,
    Search,
    Users,
    UserCheck,
    UserX,
    RefreshCw,
    Smartphone,
    Battery,
    Wifi,
    Navigation
} from "lucide-react"
import Image from "next/image"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { fetchLiveGuards, fetchGuardsByStatus, fetchGuardLocationHistory } from "@/store/slices/liveTrackingSlice"
import { LiveGuard } from "@/app/types/liveTracking"
import { useAlert } from "../contexts/AlertContext"
import { Separator } from "../ui/separator"
import { ScrollArea } from "../ui/scroll-area"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { GuardLiveCard } from '../guard/guard-live-card'

// Types for address data
interface AddressComponent {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
}

interface NominatimResponse {
    address?: AddressComponent;
    display_name?: string;
}

interface LocationAddress {
    city: string;
    state: string;
    country: string;
    fullAddress: string;
}

declare global {
    interface Window {
        google: typeof google;
        initMap?: () => void;
    }
}

export function GuardLiveMapPage() {
    const dispatch = useAppDispatch()
    const { guards: liveGuards, isLoading: liveGuardsLoading, locationHistory } = useAppSelector((state) => state.liveTracking)
    const [selectedGuard, setSelectedGuard] = useState<LiveGuard | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all')
    const [activeTab, setActiveTab] = useState<'list' | 'map'>('list')
    const { showAlert } = useAlert()
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [historyAddresses, setHistoryAddresses] = useState<Map<number, NominatimResponse>>(new Map())
    const [isLoadingHistoryAddresses, setIsLoadingHistoryAddresses] = useState(false)

    // Location address states
    const [locationAddress, setLocationAddress] = useState<LocationAddress | null>(null);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [addressError, setAddressError] = useState<string | null>(null);

    // Map states
    const [mapLoaded, setMapLoaded] = useState(false)
    const [mapError, setMapError] = useState<string | null>(null)
    const [currentLocationIndex, setCurrentLocationIndex] = useState(0)
    const mapRef = useRef<HTMLDivElement>(null)
    const googleMapRef = useRef<google.maps.Map | null>(null)
    const markerRef = useRef<google.maps.Marker | null>(null)
    const historyPathRef = useRef<google.maps.Polyline | null>(null)
    const historyMarkersRef = useRef<google.maps.Marker[]>([])
    const scriptRef = useRef<HTMLScriptElement | null>(null)
    const animationIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Load Google Maps script
    useEffect(() => {
        if (window.google?.maps) {
            setMapLoaded(true)
            return
        }

        if (scriptRef.current) return

        const script = document.createElement('script')
        scriptRef.current = script
        script.id = 'google-maps-script'
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.defer = true

        script.onload = () => {
            setMapLoaded(true)
            setMapError(null)
        }

        script.onerror = () => {
            setMapError('Failed to load Google Maps. Please check your API key.')
            scriptRef.current = null
        }

        document.head.appendChild(script)

        return () => {
            if (scriptRef.current) {
                document.head.removeChild(scriptRef.current)
                scriptRef.current = null
            }
        }
    }, [])

    // Fetch guards on load
    useEffect(() => {
        if (statusFilter === 'all') {
            dispatch(fetchLiveGuards({ per_page: 100 }))
        } else {
            dispatch(fetchGuardsByStatus(statusFilter))
        }
    }, [dispatch, statusFilter])

    // Fetch addresses for history points
    const fetchAddressForPoint = async (latitude: number, longitude: number, index: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
            );
            if (response.ok) {
                const data: NominatimResponse = await response.json();
                setHistoryAddresses(prev => new Map(prev).set(index, data));
            }
        } catch (error) {
            console.error('Error fetching history address:', error);
        }
    };

    // Fetch addresses for all history points when modal opens
    useEffect(() => {
        if (showHistoryModal && locationHistory.length > 0) {
            setIsLoadingHistoryAddresses(true);
            const fetchPromises = locationHistory.map(async (point, index) => {
                await fetchAddressForPoint(Number(point.latitude), Number(point.longitude), index);
            });
            Promise.all(fetchPromises).finally(() => {
                setIsLoadingHistoryAddresses(false);
            });
        }
    }, [showHistoryModal, locationHistory]);

    // Reverse geocoding when selected guard changes
    useEffect(() => {
        if (!selectedGuard || !selectedGuard.location) return;

        const latitude = selectedGuard.location.latitude;
        const longitude = selectedGuard.location.longitude;
        const hasValidLocation = latitude && longitude && Number(latitude) !== 0 && Number(longitude) !== 0;

        if (!hasValidLocation) {
            setLocationAddress(null);
            setAddressError(null);
            return;
        }

        const fetchAddress = async () => {
            setIsLoadingAddress(true);
            setAddressError(null);

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: NominatimResponse = await response.json();

                if (data && data.address) {
                    const addressComponents = data.address;
                    const city = addressComponents.city || addressComponents.town || addressComponents.village || 'Not available';
                    const state = addressComponents.state || 'Not available';
                    const country = addressComponents.country || 'Not available';

                    setLocationAddress({
                        city: city,
                        state: state,
                        country: country,
                        fullAddress: data.display_name || 'Address not available'
                    });
                } else {
                    setAddressError('No address found for these coordinates');
                }
            } catch (error) {
                console.error('Error fetching address:', error);
                setAddressError('Failed to load address information');
            } finally {
                setIsLoadingAddress(false);
            }
        };

        fetchAddress();
    }, [selectedGuard]);

    // Filter guards based on search and status
    const filteredGuards = liveGuards.filter(guard => {
        const matchesSearch = guard.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guard.guard_code?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || guard.online_status === statusFilter
        return matchesSearch && matchesStatus
    })

    const handleViewDetails = async (guard: LiveGuard) => {
        setSelectedGuard(guard)
        setMapError(null)
        setCurrentLocationIndex(0)

        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current)
            animationIntervalRef.current = null
        }

        if (guard.id) {
            await dispatch(fetchGuardLocationHistory({ guardId: guard.id, hours: 24 }))
        }
        setActiveTab('map')
    }

    // Initialize map when guard with location is selected
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || !selectedGuard || !window.google?.maps) return

        const hasLocation = selectedGuard.location &&
            selectedGuard.location.latitude &&
            selectedGuard.location.longitude &&
            Number(selectedGuard.location.latitude) !== 0 &&
            Number(selectedGuard.location.longitude) !== 0

        if (!hasLocation) {
            setMapError('No location data available for this guard')
            return
        }

        try {
            const currentLocation = {
                lat: Number(selectedGuard.location!.latitude),
                lng: Number(selectedGuard.location!.longitude),
            }

            if (!googleMapRef.current) {
                googleMapRef.current = new window.google.maps.Map(mapRef.current, {
                    center: currentLocation,
                    zoom: 15,
                    mapTypeControl: true,
                    streetViewControl: true,
                    fullscreenControl: true,
                })

                markerRef.current = new window.google.maps.Marker({
                    position: currentLocation,
                    map: googleMapRef.current,
                    title: selectedGuard.full_name,
                    animation: window.google.maps.Animation.DROP,
                    icon: {
                        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                        scaledSize: new window.google.maps.Size(40, 40)
                    }
                })

                const infoWindow = new window.google.maps.InfoWindow({
                    content: `
                        <div style="padding: 8px;">
                            <strong>${selectedGuard.full_name}</strong><br/>
                            Status: ${selectedGuard.online_status}<br/>
                            Last updated: ${selectedGuard.location?.updated_ago || 'N/A'}
                        </div>
                    `
                })

                markerRef.current.addListener('click', () => {
                    infoWindow.open(googleMapRef.current, markerRef.current)
                })
            } else {
                googleMapRef.current.setCenter(currentLocation)
                googleMapRef.current.setZoom(15)
                if (markerRef.current) {
                    markerRef.current.setPosition(currentLocation)
                }
            }

            if (locationHistory.length > 0) {
                if (historyPathRef.current) {
                    historyPathRef.current.setMap(null)
                }
                historyMarkersRef.current.forEach(marker => marker.setMap(null))
                historyMarkersRef.current = []

                const pathCoordinates = locationHistory.map(point => ({
                    lat: Number(point.latitude),
                    lng: Number(point.longitude)
                }))

                historyPathRef.current = new window.google.maps.Polyline({
                    path: pathCoordinates,
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.7,
                    strokeWeight: 3,
                })
                historyPathRef.current.setMap(googleMapRef.current)

                locationHistory.forEach((point, index) => {
                    const marker = new window.google.maps.Marker({
                        position: { lat: Number(point.latitude), lng: Number(point.longitude) },
                        map: googleMapRef.current,
                        title: point.formatted_time,
                        icon: {
                            url: index === locationHistory.length - 1
                                ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                                : 'http://maps.google.com/mapfiles/ms/icons/grey-dot.png',
                            scaledSize: new window.google.maps.Size(30, 30)
                        }
                    })

                    const infoContent = `
                        <div style="padding: 8px;">
                            <strong>Time:</strong> ${point.formatted_time}<br/>
                            <strong>Location:</strong> ${Number(point.latitude).toFixed(6)}, ${Number(point.longitude).toFixed(6)}<br/>
                            ${point.duty_location_match ? '<span style="color: green;">✓ At duty location</span>' : ''}
                        </div>
                    `

                    const infoWindow = new window.google.maps.InfoWindow({ content: infoContent })
                    marker.addListener('click', () => {
                        infoWindow.open(googleMapRef.current, marker)
                    })
                    historyMarkersRef.current.push(marker)
                })

                const bounds = new window.google.maps.LatLngBounds()
                pathCoordinates.forEach(coord => bounds.extend(coord))
                googleMapRef.current.fitBounds(bounds)
            }

            setMapError(null)
        } catch (err) {
            console.error('Error initializing map:', err)
            setMapError("Failed to initialize map")
        }
    }, [mapLoaded, selectedGuard, locationHistory])

    const animateHistory = () => {
        if (locationHistory.length === 0 || !googleMapRef.current) return

        let index = 0
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current)
            animationIntervalRef.current = null
        }

        animationIntervalRef.current = setInterval(() => {
            if (index < locationHistory.length && googleMapRef.current) {
                const point = locationHistory[index]
                googleMapRef.current.setCenter({
                    lat: Number(point.latitude),
                    lng: Number(point.longitude)
                })
                googleMapRef.current.setZoom(17)

                if (markerRef.current) {
                    markerRef.current.setPosition({
                        lat: Number(point.latitude),
                        lng: Number(point.longitude)
                    })
                }

                setCurrentLocationIndex(index)
                index++
            } else {
                if (animationIntervalRef.current) {
                    clearInterval(animationIntervalRef.current)
                    animationIntervalRef.current = null
                }
            }
        }, 2000)
    }

    const stopAnimation = () => {
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current)
            animationIntervalRef.current = null
        }
    }

    const handleSendAlert = (guardName: string) => {
        showAlert(`Alert sent successfully to ${guardName}`, 'success')
    }

    const refreshData = () => {
        if (statusFilter === 'all') {
            dispatch(fetchLiveGuards({ per_page: 100 }))
        } else {
            dispatch(fetchGuardsByStatus(statusFilter))
        }
    }

    const onlineCount = liveGuards.filter(g => g.online_status === 'online').length
    const offlineCount = liveGuards.filter(g => g.online_status === 'offline').length

    return (
        <div className="flex flex-1 flex-col h-full">
            <div className="@container/main flex flex-1 flex-col gap-4 h-full">
                {/* Header Section */}
                <div className="pt-4 px-4 md:px-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Live Guard Tracking</h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Real-time location tracking of security officers
                                </p>
                            </div>
                            <Button onClick={refreshData} variant="outline" size="sm" className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </Button>
                        </div>

                        
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-4 md:px-6 pb-6">
                    <Card className="shadow-sm rounded-2xl">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Filter Tabs */}
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant={statusFilter === 'all' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setStatusFilter('all')}
                                        className="gap-2"
                                    >
                                        <Users className="h-4 w-4" />
                                        All ({liveGuards.length})
                                    </Button>
                                    <Button
                                        variant={statusFilter === 'online' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setStatusFilter('online')}
                                        className="gap-2 bg-green-500 hover:bg-green-600 text-white"
                                    >
                                        <UserCheck className="h-4 w-4" />
                                        Online ({onlineCount})
                                    </Button>
                                    <Button
                                        variant={statusFilter === 'offline' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setStatusFilter('offline')}
                                        className="gap-2"
                                    >
                                        <UserX className="h-4 w-4" />
                                        Offline ({offlineCount})
                                    </Button>
                                </div>

                                {/* Search Input */}
                                <div className="relative w-full lg:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'map')} className="w-full">
                                <div className="px-4 border-b">
                                    <TabsList className="h-12">
                                        <TabsTrigger value="list" className="gap-2">
                                            <List className="h-4 w-4" />
                                            List View
                                        </TabsTrigger>
                                        <TabsTrigger value="map" className="gap-2" disabled={!selectedGuard}>
                                            <MapPin className="h-4 w-4" />
                                            Map View {selectedGuard && `- ${selectedGuard.full_name}`}
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* List View Tab */}
                                <TabsContent value="list" className="m-0">
                                    <div className="p-4">
                                        {liveGuardsLoading ? (
                                            <div className="flex justify-center py-12">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                            </div>
                                        ) : filteredGuards.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-500">No guards found</p>
                                                <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {filteredGuards.map((guard) => (
                                                    <GuardLiveCard
                                                        key={guard.id}
                                                        guard={{
                                                            id: guard.id.toString(),
                                                            name: guard.full_name,
                                                            avatar: guard.profile_image || '/images/avatar.png',
                                                            rating: 4.5,
                                                            status: guard.online_status === 'online' ? 'on-duty' : 'off-duty',
                                                            displayStatus: guard.online_status === 'online' ? 'Online' : 'Offline',
                                                            mission: guard.current_assignment?.title || 'No active mission',
                                                            site: guard.current_assignment?.site_name || 'No site assigned',
                                                            address: guard.location ? `Lat: ${Number(guard.location.latitude).toFixed(6)}, Lng: ${Number(guard.location.longitude).toFixed(6)}` : 'Location not available',
                                                            startTime: guard.current_assignment?.start_time ? new Date(guard.current_assignment.start_time).toLocaleTimeString() : 'N/A',
                                                            endTime: guard.current_assignment?.end_time ? new Date(guard.current_assignment.end_time).toLocaleTimeString() : 'N/A',
                                                            lastUpdate: guard.last_ping_at ? `${Math.floor((new Date().getTime() - new Date(guard.last_ping_at).getTime()) / 60000)} min ago` : 'N/A',
                                                            phone: guard.phone || 'N/A',
                                                            email: `guard${guard.id}@example.com`,
                                                            idNumber: guard.guard_code || `#GRD-${String(guard.id).padStart(4, '0')}`,
                                                            totalShifts: 0,
                                                            checkIn: guard.last_activity_at ? new Date(guard.last_activity_at).toLocaleString() : 'Not checked in',
                                                            notes: [],
                                                            coordinates: guard.location && Number(guard.location.latitude) !== 0 && Number(guard.location.longitude) !== 0 ? {
                                                                lat: Number(guard.location.latitude),
                                                                lng: Number(guard.location.longitude)
                                                            } : undefined,
                                                            siteDetails: {
                                                                name: guard.current_assignment?.site_name,
                                                                address: guard.current_assignment?.site_name,
                                                                instructions: undefined,
                                                                guardsRequired: 0,
                                                            },
                                                            dutyDetails: {
                                                                name: guard.current_assignment?.title,
                                                                startTime: guard.current_assignment?.start_time,
                                                                endTime: guard.current_assignment?.end_time,
                                                                status: guard.online_status
                                                            }
                                                        }}
                                                        isExpanded={false}
                                                        onViewDetails={() => handleViewDetails(guard)}
                                                        onSendAlert={() => handleSendAlert(guard.full_name)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Map View Tab */}
                                <TabsContent value="map" className="m-0">
                                    {selectedGuard ? (
                                        <div className="p-4 space-y-4">
                                            {/* Selected Guard Info */}
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                        <Image
                                                            src={selectedGuard.profile_image || '/images/avatar.png'}
                                                            alt={selectedGuard.full_name}
                                                            width={40}
                                                            height={40}
                                                            className="object-cover"
                                                        />
                                                        {selectedGuard.online_status === 'online' && (
                                                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5">
                                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                                                <span className="relative inline-flex h-full w-full rounded-full bg-green-500 ring-2 ring-white" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">{selectedGuard.full_name}</h3>
                                                        <p className="text-xs text-gray-500">{selectedGuard.guard_code}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {locationHistory.length > 0 && (
                                                        <>
                                                            <Button onClick={animateHistory} size="sm" variant="outline">
                                                                ▶ Play
                                                            </Button>
                                                            <Button onClick={stopAnimation} size="sm" variant="outline">
                                                                ⏹ Stop
                                                            </Button>
                                                            <Button onClick={() => setShowHistoryModal(true)} size="sm" variant="outline">
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                History
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Map */}
                                            <div className="relative w-full h-[500px] rounded-lg overflow-hidden border">
                                                <div ref={mapRef} className="w-full h-full bg-gray-100" />
                                                {mapError && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                                                        <div className="text-center p-4">
                                                            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                                            <p className="text-sm text-red-600">{mapError}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {!mapLoaded && !mapError && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Location Info */}
                                            {selectedGuard.location && (
                                                <Card>
                                                    <CardContent className="p-4">
                                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                            <MapPin className="h-4 w-4" />
                                                            Current Location
                                                        </h4>

                                                        {isLoadingAddress ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                                                                <p className="text-sm text-gray-500">Loading address...</p>
                                                            </div>
                                                        ) : addressError ? (
                                                            <p className="text-sm text-red-600">{addressError}</p>
                                                        ) : locationAddress && (
                                                            <div className="space-y-2">
                                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                                    {locationAddress.city !== 'Not available' && (
                                                                        <div>
                                                                            <p className="text-gray-500">City</p>
                                                                            <p className="font-medium">{locationAddress.city}</p>
                                                                        </div>
                                                                    )}
                                                                    {locationAddress.state !== 'Not available' && (
                                                                        <div>
                                                                            <p className="text-gray-500">State</p>
                                                                            <p className="font-medium">{locationAddress.state}</p>
                                                                        </div>
                                                                    )}
                                                                    {locationAddress.country !== 'Not available' && (
                                                                        <div>
                                                                            <p className="text-gray-500">Country</p>
                                                                            <p className="font-medium">{locationAddress.country}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {locationAddress.fullAddress && (
                                                                    <div className="pt-2 border-t">
                                                                        <p className="text-xs text-gray-500 break-words">
                                                                            {locationAddress.fullAddress}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                <div className="pt-2 border-t grid grid-cols-2 gap-2 text-xs">
                                                                    <div>
                                                                        <p className="text-gray-500">Latitude</p>
                                                                        <p className="font-mono">{selectedGuard.location.latitude}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500">Longitude</p>
                                                                        <p className="font-mono">{selectedGuard.location.longitude}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500">Accuracy</p>
                                                                        <p>{selectedGuard.location.accuracy} m</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500">Last Updated</p>
                                                                        <p>{selectedGuard.location.updated_ago}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-[400px] text-center">
                                            <div>
                                                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-600 font-medium mb-2">No guard selected</p>
                                                <p className="text-sm text-gray-500">Click &quot;View Details&quot; on any guard to see their location</p>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* History Modal */}
            <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
                <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <List className="w-4 h-4 sm:w-5 sm:h-5" />
                            Location History - {selectedGuard?.full_name}
                        </DialogTitle>
                    </DialogHeader>
                    <Separator className="my-3 sm:my-4" />

                    <ScrollArea className="h-[50vh] sm:h-[60vh] pr-2 sm:pr-4">
                        {isLoadingHistoryAddresses && locationHistory.length === 0 ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {locationHistory.map((point, index) => {
                                    const address = historyAddresses.get(index);
                                    return (
                                        <Card key={index} className="relative">
                                            <CardContent className="p-3 sm:p-4">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <Badge variant={index === locationHistory.length - 1 ? "default" : "secondary"} className="text-xs">
                                                                {index === locationHistory.length - 1 ? "Latest" : `Point ${index + 1}`}
                                                            </Badge>
                                                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                                                                <Clock className="w-3 h-3" />
                                                                {point.formatted_time}
                                                            </div>
                                                        </div>

                                                        {/* Address Information */}
                                                        {address ? (
                                                            <div className="mb-3 space-y-1">
                                                                {address.address && (
                                                                    <>
                                                                        {(address.address.city || address.address.town || address.address.village) && (
                                                                            <p className="text-xs sm:text-sm break-words">
                                                                                <span className="font-medium">City:</span> {address.address.city || address.address.town || address.address.village}
                                                                            </p>
                                                                        )}
                                                                        {address.address.state && (
                                                                            <p className="text-xs sm:text-sm break-words">
                                                                                <span className="font-medium">State:</span> {address.address.state}
                                                                            </p>
                                                                        )}
                                                                        {address.address.country && (
                                                                            <p className="text-xs sm:text-sm break-words">
                                                                                <span className="font-medium">Country:</span> {address.address.country}
                                                                            </p>
                                                                        )}
                                                                        {address.display_name && (
                                                                            <div className="mt-2 pt-2 border-t">
                                                                                <p className="text-xs text-gray-600 break-words">
                                                                                    <span className="font-medium">Full Address:</span><br />
                                                                                    {address.display_name}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="mb-3 p-2 bg-gray-50 rounded">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                                                    <p className="text-xs text-gray-500">Loading address...</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Coordinates */}
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div>
                                                                <p className="text-gray-500">Latitude</p>
                                                                <p className="font-mono break-all">{point.latitude}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Longitude</p>
                                                                <p className="font-mono break-all">{point.longitude}</p>
                                                            </div>
                                                            {point.accuracy && (
                                                                <div>
                                                                    <p className="text-gray-500">Accuracy</p>
                                                                    <p>{point.accuracy} m</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Duty Location Match */}
                                                        {point.duty_location_match !== undefined && (
                                                            <div className="mt-2">
                                                                <Badge className={point.duty_location_match ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                                    {point.duty_location_match ? '✓ At duty location' : '⚠ Away from duty location'}
                                                                </Badge>
                                                                {point.distance_from_duty_meters && (
                                                                    <span className="ml-2 text-xs text-gray-500">
                                                                        {Number(point.distance_from_duty_meters).toFixed(0)}m away
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="flex-shrink-0"
                                                        onClick={() => {
                                                            if (googleMapRef.current) {
                                                                googleMapRef.current.setCenter({
                                                                    lat: Number(point.latitude),
                                                                    lng: Number(point.longitude)
                                                                });
                                                                googleMapRef.current.setZoom(17);
                                                                setShowHistoryModal(false);
                                                            }
                                                        }}
                                                    >
                                                        <MapPin className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default GuardLiveMapPage