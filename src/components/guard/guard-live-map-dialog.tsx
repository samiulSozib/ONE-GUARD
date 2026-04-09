'use client'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ReactNode, useState, useEffect, useRef } from 'react'
import Image from "next/image"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { SearchIcon, MapPin, Phone, Mail, Calendar, Clock, AlertCircle, MessageCircle, AlertTriangle, User, Building, CheckCircle, Navigation, Radio, RadioIcon } from "lucide-react"
import { GuardLiveCard } from "./guard-live-card"
import { Card, CardContent } from "../ui/card"
import { useAlert } from "../contexts/AlertContext"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { fetchAssignments } from "@/store/slices/guardAssignmentSlice"
import { fetchLiveGuards, fetchGuardsByStatus, fetchGuardLocationHistory } from "@/store/slices/liveTrackingSlice"
import { GuardAssignment } from "@/app/types/guardAssignment"
import { LiveGuard } from "@/app/types/liveTracking"
import { Badge } from "../ui/badge"
import { Label } from "../ui/label"

interface LiveMapDialogProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

declare global {
  interface Window {
    google: typeof google;
    initMap?: () => void;
  }
}
// Google Maps types
/// <reference types="@types/google.maps" />

declare global {
    interface Window {
        initMap?: () => void;
    }
}

// Helper function to format guard status
const formatGuardStatus = (status?: string): 'on-duty' | 'off-duty' | 'break' => {
    switch (status) {
        case 'checked_in':
        case 'on_duty':
            return 'on-duty';
        case 'assigned':
        case 'accepted':
            return 'off-duty';
        case 'completed':
        case 'cancelled':
            return 'off-duty';
        default:
            return 'off-duty';
    }
};

// Helper function to get display status text
const getStatusDisplayText = (status?: string): string => {
    switch (status) {
        case 'checked_in':
            return 'Checked In';
        case 'on_duty':
            return 'On Duty';
        case 'assigned':
            return 'Assigned';
        case 'accepted':
            return 'Accepted';
        case 'completed':
            return 'Completed';
        case 'late':
            return 'Late';
        case 'no_show':
            return 'No Show';
        case 'cancelled':
            return 'Cancelled';
        default:
            return status || 'Unknown';
    }
};

export function GuardLiveMap({ trigger, isOpen, onOpenChange }: LiveMapDialogProps) {
    const dispatch = useAppDispatch()
    const { assignments, isLoading: assignmentsLoading } = useAppSelector((state) => state.guardAssignment)
    const { guards: liveGuards, isLoading: liveGuardsLoading, locationHistory } = useAppSelector((state) => state.liveTracking)
    const [selectedGuard, setSelectedGuard] = useState<LiveGuard | null>(null)
    const [expandedCard, setExpandedCard] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [guardFilter, setGuardFilter] = useState<'all' | 'online' | 'offline'>('all')
    const { showAlert } = useAlert()

    // Location address states
    const [locationAddress, setLocationAddress] = useState<{
        city: string;
        state: string;
        country: string;
        fullAddress: string;
    } | null>(null);
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
            queueMicrotask(() => {
                setMapLoaded(true)
            })
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

    // Fetch guards when dialog opens
    useEffect(() => {
        if (isOpen) {
            if (guardFilter === 'all') {
                dispatch(fetchLiveGuards({ per_page: 100 }))
            } else {
                dispatch(fetchGuardsByStatus(guardFilter))
            }
        }
    }, [dispatch, isOpen, guardFilter])

    // Reverse geocoding using OpenStreetMap Nominatim when selected guard changes
    useEffect(() => {
        if (!selectedGuard || !selectedGuard.location) return;

        const latitude = selectedGuard.location.latitude;
        const longitude = selectedGuard.location.longitude;
        const hasValidLocation = latitude && longitude && 
            Number(latitude) !== 0 && Number(longitude) !== 0;

        if (!hasValidLocation) {
            setLocationAddress(null);
            setAddressError(null);
            return;
        }

        const fetchAddress = async () => {
            setIsLoadingAddress(true);
            setAddressError(null);
            
            try {
                // Nominatim API - No API key required!
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data && data.address) {
                    const addressComponents = data.address;
                    
                    // Extract city, state, country from response
                    const city = addressComponents.city || 
                                addressComponents.town || 
                                addressComponents.village || 
                                'Not available';
                    
                    const state = addressComponents.state || 'Not available';
                    const country = addressComponents.country || 'Not available';
                    
                    setLocationAddress({
                        city: city,
                        state: state,
                        country: country,
                        fullAddress: data.display_name
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

    // Filter guards based on search
    const filteredGuards = liveGuards.filter(guard => {
        const guardName = guard.full_name?.toLowerCase() || ''
        const guardCode = guard.guard_code?.toLowerCase() || ''
        const searchLower = searchTerm.toLowerCase()

        return guardName.includes(searchLower) || guardCode.includes(searchLower)
    })

    const handleViewDetails = async (guard: LiveGuard) => {
        setExpandedCard(expandedCard === guard.id ? null : guard.id)
        setSelectedGuard(guard)
        setMapError(null)
        setCurrentLocationIndex(0)
        
        // Clear existing animation interval
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current)
            animationIntervalRef.current = null
        }
        
        // Fetch location history for the selected guard
        if (guard.id) {
            await dispatch(fetchGuardLocationHistory({ guardId: guard.id, hours: 24 }))
        }
    }

    // Initialize map when guard with location is selected
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || !selectedGuard || !window.google?.maps) return

        // Check if guard has location
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

                // Create marker for current location
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

                // Add info window
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
                    markerRef.current.setTitle(selectedGuard.full_name)
                }
            }

            // Draw location history path if available
            if (locationHistory.length > 0) {
                // Clear existing path and markers
                if (historyPathRef.current) {
                    historyPathRef.current.setMap(null)
                }
                historyMarkersRef.current.forEach(marker => marker.setMap(null))
                historyMarkersRef.current = []

                // Create path coordinates
                const pathCoordinates = locationHistory.map(point => ({
                    lat: Number(point.latitude),
                    lng: Number(point.longitude)
                }))

                // Draw polyline
                historyPathRef.current = new window.google.maps.Polyline({
                    path: pathCoordinates,
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.7,
                    strokeWeight: 3,
                })
                historyPathRef.current.setMap(googleMapRef.current)

                // Add markers for history points
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

                // Fit bounds to show all points
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

    // Animate through history points
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

    // Stop animation
    const stopAnimation = () => {
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current)
            animationIntervalRef.current = null
        }
    }

    const handleSendAlert = (guardName: string) => {
        showAlert(`Alert sent successfully to ${guardName}`, 'success')
    }

    // Transform live guard data to match GuardLiveCard props
    const transformGuardToCardProps = (guard: LiveGuard) => {
        return {
            id: guard.id.toString(),
            name: guard.full_name,
            avatar: guard.profile_image ? `/${guard.profile_image}` : '/images/avatar.png',
            rating: 4.5,
            status: guard.online_status === 'online' ? 'on-duty' : 'off-duty',
            displayStatus: guard.online_status === 'online' ? 'Online' : 'Offline',
            mission: guard.current_assignment?.title || 'No active mission',
            site: guard.current_assignment?.site_name || 'No site assigned',
            address: guard.location ? 
                `Lat: ${Number(guard.location.latitude).toFixed(6)}, Lng: ${Number(guard.location.longitude).toFixed(6)}` : 
                'Location not available',
            startTime: guard.current_assignment?.start_time ? 
                new Date(guard.current_assignment.start_time).toLocaleTimeString() : 'N/A',
            endTime: guard.current_assignment?.end_time ? 
                new Date(guard.current_assignment.end_time).toLocaleTimeString() : 'N/A',
            lastUpdate: guard.last_ping_at ? 
                `${Math.floor((new Date().getTime() - new Date(guard.last_ping_at).getTime()) / 60000)} min ago` : 
                'N/A',
            phone: guard.phone || 'N/A',
            email: `guard${guard.id}@example.com`,
            idNumber: guard.guard_code || `#GRD-${String(guard.id).padStart(4, '0')}`,
            totalShifts: 0,
            checkIn: guard.last_activity_at ? 
                new Date(guard.last_activity_at).toLocaleString() : 'Not checked in',
            notes: [],
            coordinates: guard.location && 
                Number(guard.location.latitude) !== 0 && 
                Number(guard.location.longitude) !== 0 ? {
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
        }
    }

    const isLoading = assignmentsLoading || liveGuardsLoading

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1400px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900">
                <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
                    {/* Header with Filters */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
                        <div className="flex items-center gap-4">
                            <Image
                                src="/images/logo.png"
                                width={36}
                                height={36}
                                alt="Company logo"
                            />
                            <h2 className="text-xl font-bold">Live Guard Tracking</h2>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Radio Buttons for Online/Offline Filter */}
                            <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                                <Label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="guardFilter"
                                        value="all"
                                        checked={guardFilter === 'all'}
                                        onChange={() => setGuardFilter('all')}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm">All ({liveGuards.length})</span>
                                </Label>
                                <Label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="guardFilter"
                                        value="online"
                                        checked={guardFilter === 'online'}
                                        onChange={() => setGuardFilter('online')}
                                        className="w-4 h-4 text-green-600"
                                    />
                                    <span className="text-sm text-green-600">Online ({liveGuards.filter(g => g.online_status === 'online').length})</span>
                                </Label>
                                <Label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="guardFilter"
                                        value="offline"
                                        checked={guardFilter === 'offline'}
                                        onChange={() => setGuardFilter('offline')}
                                        className="w-4 h-4 text-gray-600"
                                    />
                                    <span className="text-sm text-gray-600">Offline ({liveGuards.filter(g => g.online_status === 'offline').length})</span>
                                </Label>
                            </div>

                            {/* Search Input */}
                            <InputGroup className="w-64">
                                <InputGroupInput
                                    placeholder="Search guards..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                />
                                <InputGroupAddon className="bg-[#5F0015] p-2 rounded-r-md">
                                    <SearchIcon className="text-white w-4 h-4" />
                                </InputGroupAddon>
                            </InputGroup>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
                        {/* Left Column - Guards List */}
                        <div className="lg:col-span-5 order-2 lg:order-1">
                            <div className="flex flex-col gap-1 sm:gap-2 mb-2 sm:mb-3">
                                <span className="text-black dark:text-white font-semibold text-sm sm:text-base">
                                    {filteredGuards.length} guards found
                                </span>
                                <span className="text-black dark:text-white font-bold text-xl sm:text-2xl">
                                    Guards {guardFilter === 'online' ? 'Online' : guardFilter === 'offline' ? 'Offline' : 'on Duty'}
                                </span>
                            </div>

                            {/* Guards List */}
                            <div className="space-y-2 sm:space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    </div>
                                ) : filteredGuards.length > 0 ? (
                                    filteredGuards.map(guard => (
                                        <GuardLiveCard
                                            key={guard.id}
                                            guard={transformGuardToCardProps(guard)}
                                            isExpanded={expandedCard === guard.id}
                                            onViewDetails={() => handleViewDetails(guard)}
                                            onSendAlert={() => handleSendAlert(guard.full_name)}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No {guardFilter === 'online' ? 'online' : guardFilter === 'offline' ? 'offline' : ''} guards found
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Map & Detailed View */}
                        <div className="lg:col-span-7 order-1 lg:order-2">
                            <div className="flex flex-col gap-4">
                                {selectedGuard ? (
                                    <div className="space-y-4">
                                        {/* Guard Info Header */}
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                                            <Image
                                                                src={selectedGuard.profile_image || '/images/avatar.png'}
                                                                alt={selectedGuard.full_name}
                                                                width={48}
                                                                height={48}
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold">{selectedGuard.full_name}</h3>
                                                            <p className="text-sm text-gray-500">{selectedGuard.guard_code}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={selectedGuard.online_status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                        {selectedGuard.online_status === 'online' ? '● Online' : '● Offline'}
                                                    </Badge>
                                                </div>
                                                
                                                {selectedGuard.device_info && (
                                                    <div className="mt-3 flex gap-4 text-sm">
                                                        <span>🔋 Battery: {selectedGuard.device_info.battery_level}%</span>
                                                        <span>📡 Network: {selectedGuard.device_info.network_type}</span>
                                                        {selectedGuard.device_info.is_charging && <span>⚡ Charging</span>}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Location History Controls */}
                                        {locationHistory.length > 0 && (
                                            <div className="flex gap-2">
                                                <Button 
                                                    onClick={animateHistory}
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    ▶ Play History
                                                </Button>
                                                <Button 
                                                    onClick={stopAnimation}
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    ⏹ Stop
                                                </Button>
                                                <div className="ml-auto text-sm text-gray-500">
                                                    {currentLocationIndex + 1} / {locationHistory.length} locations
                                                </div>
                                            </div>
                                        )}

                                        {/* Map Section */}
                                        <div
                                            ref={mapRef}
                                            className="w-full h-[450px] bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700 relative overflow-hidden"
                                        >
                                            {mapError && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
                                                    <div className="text-center p-4">
                                                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                                        <p className="text-sm text-red-600 dark:text-red-400">{mapError}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {!mapLoaded && !mapError && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                                                    <div className="text-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                        <p className="text-sm text-gray-500">Loading map...</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Location Info with Address */}
                                        {selectedGuard.location && (
                                            <Card>
                                                <CardContent className="p-4">
                                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                        <MapPin className="w-4 h-4" />
                                                        Current Location
                                                    </h4>
                                                    
                                                    {/* Address Information */}
                                                    {isLoadingAddress ? (
                                                        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                            <div className="flex items-center gap-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                                <p className="text-sm text-gray-500">Loading address information...</p>
                                                            </div>
                                                        </div>
                                                    ) : addressError ? (
                                                        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                                            <p className="text-sm text-red-600 mb-2">{addressError}</p>
                                                        </div>
                                                    ) : locationAddress && (
                                                        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded space-y-1">
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                                📍 Location Details
                                                            </p>
                                                            <div className="pl-2 space-y-1">
                                                                {locationAddress.city && locationAddress.city !== 'Not available' && (
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        City: <span className="font-medium">{locationAddress.city}</span>
                                                                    </p>
                                                                )}
                                                                {locationAddress.state && locationAddress.state !== 'Not available' && (
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        State: <span className="font-medium">{locationAddress.state}</span>
                                                                    </p>
                                                                )}
                                                                {locationAddress.country && locationAddress.country !== 'Not available' && (
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        Country: <span className="font-medium">{locationAddress.country}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {locationAddress.fullAddress && (
                                                                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        <span className="font-medium">Full Address:</span><br />
                                                                        {locationAddress.fullAddress}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Coordinates Grid */}
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
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
                                                        {selectedGuard.location.duty_location_match !== undefined && (
                                                            <div className="col-span-2">
                                                                <Badge className={selectedGuard.location.duty_location_match ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                                    {selectedGuard.location.duty_location_match ? '✓ At duty location' : '⚠ Away from duty location'}
                                                                </Badge>
                                                                {selectedGuard.location.distance_from_duty_meters && (
                                                                    <span className="ml-2 text-xs text-gray-500">
                                                                        {Number(selectedGuard.location.distance_from_duty_meters).toFixed(0)}m away
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                                        <div className="text-center p-6">
                                            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mb-2">
                                                Select a guard to view location
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Click on any guard from the list to see their current location on map
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}