'use client'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ReactNode, useState, useEffect, useRef } from 'react'
import Image from "next/image"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { SearchIcon, MapPin, Clock, AlertCircle, Eye, List } from "lucide-react"
import { GuardLiveCard } from "./guard-live-card"
import { Card, CardContent } from "../ui/card"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { fetchLiveGuards, fetchGuardsByStatus, fetchGuardLocationHistory } from "@/store/slices/liveTrackingSlice"
import { LiveGuard } from "@/app/types/liveTracking"
import { Badge } from "../ui/badge"
import { Label } from "../ui/label"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import { useAlert } from "../contexts/AlertContext"

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

export function GuardLiveMap({ trigger, isOpen, onOpenChange }: LiveMapDialogProps) {
    const dispatch = useAppDispatch()
    const { isLoading: assignmentsLoading } = useAppSelector((state) => state.guardAssignment)
    const { guards: liveGuards, isLoading: liveGuardsLoading, locationHistory } = useAppSelector((state) => state.liveTracking)
    const [selectedGuard, setSelectedGuard] = useState<LiveGuard | null>(null)
    const [expandedCard, setExpandedCard] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [guardFilter, setGuardFilter] = useState<'all' | 'online' | 'offline'>('all')
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
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data: NominatimResponse = await response.json();
                
                if (data && data.address) {
                    const addressComponents = data.address;
                    
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
        
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current)
            animationIntervalRef.current = null
        }
        
        if (guard.id) {
            await dispatch(fetchGuardLocationHistory({ guardId: guard.id, hours: 24 }))
        }
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
                    markerRef.current.setTitle(selectedGuard.full_name)
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

    const viewAllHistory = () => {
        setShowHistoryModal(true)
    }

    const handleSendAlert = (guardName: string) => {
        showAlert(`Alert sent successfully to ${guardName}`, 'success')
    }

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
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[1400px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                    <div className="grid gap-4 py-2">
                        {/* Header with Filters - Responsive */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <Image
                                    src="/images/logo.png"
                                    width={32}
                                    height={32}
                                    alt="Company logo"
                                    className="w-8 h-8 sm:w-9 sm:h-9"
                                />
                                <h2 className="text-lg sm:text-xl font-bold">Live Guard Tracking</h2>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                {/* Radio Buttons - Responsive */}
                                <div className="flex items-center gap-2 sm:gap-4 bg-gray-100 dark:bg-gray-800 p-1.5 sm:p-2 rounded-lg flex-wrap">
                                    <Label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="guardFilter"
                                            value="all"
                                            checked={guardFilter === 'all'}
                                            onChange={() => setGuardFilter('all')}
                                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600"
                                        />
                                        <span className="text-xs sm:text-sm">All ({liveGuards.length})</span>
                                    </Label>
                                    <Label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="guardFilter"
                                            value="online"
                                            checked={guardFilter === 'online'}
                                            onChange={() => setGuardFilter('online')}
                                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600"
                                        />
                                        <span className="text-xs sm:text-sm text-green-600">Online ({liveGuards.filter(g => g.online_status === 'online').length})</span>
                                    </Label>
                                    <Label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="guardFilter"
                                            value="offline"
                                            checked={guardFilter === 'offline'}
                                            onChange={() => setGuardFilter('offline')}
                                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600"
                                        />
                                        <span className="text-xs sm:text-sm text-gray-600">Offline ({liveGuards.filter(g => g.online_status === 'offline').length})</span>
                                    </Label>
                                </div>

                                {/* Search Input - Responsive */}
                                <InputGroup className="w-full md:w-64">
                                    <InputGroupInput
                                        placeholder="Search guards..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="dark:bg-gray-800 dark:text-white dark:border-gray-700 text-sm"
                                    />
                                    <InputGroupAddon className="bg-[#5F0015] p-2 rounded-r-md">
                                        <SearchIcon className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>
                        </div>

                        {/* Main Content - Responsive Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* Left Column - Guards List */}
                            <div className="lg:col-span-5 order-2 lg:order-1">
                                <div className="flex flex-col gap-1 mb-3">
                                    <span className="text-black dark:text-white font-semibold text-sm">
                                        {filteredGuards.length} guards found
                                    </span>
                                    <span className="text-black dark:text-white font-bold text-xl">
                                        Guards {guardFilter === 'online' ? 'Online' : guardFilter === 'offline' ? 'Offline' : 'on Duty'}
                                    </span>
                                </div>

                                {/* Guards List - Responsive height */}
                                <div className="space-y-2 max-h-[400px] md:max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-2">
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
                                            {/* Guard Info Header - Responsive */}
                                            <Card>
                                                <CardContent className="p-3 sm:p-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                                <Image
                                                                    src={selectedGuard.profile_image || '/images/avatar.png'}
                                                                    alt={selectedGuard.full_name}
                                                                    width={48}
                                                                    height={48}
                                                                    className="object-cover"
                                                                />
                                                                {selectedGuard.online_status === 'online' && (
                                                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3">
                                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                                                        <span className="relative inline-flex h-full w-full rounded-full bg-green-500 ring-2 ring-white" />
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="text-base sm:text-lg font-bold truncate">{selectedGuard.full_name}</h3>
                                                                <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedGuard.guard_code}</p>
                                                            </div>
                                                        </div>
                                                        <Badge className={selectedGuard.online_status === 'online' ? 'bg-green-100 text-green-800 w-fit' : 'bg-gray-100 text-gray-800 w-fit'}>
                                                            {selectedGuard.online_status === 'online' ? '● Online' : '● Offline'}
                                                        </Badge>
                                                    </div>
                                                    
                                                    {selectedGuard.device_info && (
                                                        <div className="mt-3 flex flex-wrap gap-3 text-xs sm:text-sm">
                                                            <span>🔋 Battery: {selectedGuard.device_info.battery_level}%</span>
                                                            <span>📡 Network: {selectedGuard.device_info.network_type}</span>
                                                            {selectedGuard.device_info.is_charging && <span>⚡ Charging</span>}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {/* Location History Controls - Responsive */}
                                            {locationHistory.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    <Button 
                                                        onClick={animateHistory}
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700 text-sm"
                                                    >
                                                        ▶ Play History
                                                    </Button>
                                                    <Button 
                                                        onClick={stopAnimation}
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-sm"
                                                    >
                                                        ⏹ Stop
                                                    </Button>
                                                    <Button 
                                                        onClick={viewAllHistory}
                                                        size="sm"
                                                        variant="outline"
                                                        className="bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-700 text-sm"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                                                        View All
                                                    </Button>
                                                    <div className="ml-auto text-xs sm:text-sm text-gray-500">
                                                        {currentLocationIndex + 1} / {locationHistory.length} locations
                                                    </div>
                                                </div>
                                            )}

                                            {/* Map Section - Responsive height */}
                                            <div
                                                ref={mapRef}
                                                className="w-full h-[300px] sm:h-[400px] lg:h-[450px] bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700 relative overflow-hidden"
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

                                            {/* Location Info with Address - Responsive */}
                                            {selectedGuard.location && (
                                                <Card>
                                                    <CardContent className="p-3 sm:p-4">
                                                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                                                            <MapPin className="w-4 h-4" />
                                                            Current Location
                                                        </h4>
                                                        
                                                        {isLoadingAddress ? (
                                                            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                                    <p className="text-xs sm:text-sm text-gray-500">Loading address information...</p>
                                                                </div>
                                                            </div>
                                                        ) : addressError ? (
                                                            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                                                <p className="text-xs sm:text-sm text-red-600 mb-2">{addressError}</p>
                                                            </div>
                                                        ) : locationAddress && (
                                                            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded space-y-1">
                                                                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                                    📍 Location Details
                                                                </p>
                                                                <div className="pl-2 space-y-1">
                                                                    {locationAddress.city && locationAddress.city !== 'Not available' && (
                                                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                                                                            City: <span className="font-medium">{locationAddress.city}</span>
                                                                        </p>
                                                                    )}
                                                                    {locationAddress.state && locationAddress.state !== 'Not available' && (
                                                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                                                                            State: <span className="font-medium">{locationAddress.state}</span>
                                                                        </p>
                                                                    )}
                                                                    {locationAddress.country && locationAddress.country !== 'Not available' && (
                                                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                                                                            Country: <span className="font-medium">{locationAddress.country}</span>
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {locationAddress.fullAddress && (
                                                                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                                                                            <span className="font-medium">Full Address:</span><br />
                                                                            {locationAddress.fullAddress}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        {/* Coordinates Grid - Responsive */}
                                                        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                                                            <div>
                                                                <p className="text-gray-500">Latitude</p>
                                                                <p className="font-mono break-all">{selectedGuard.location.latitude}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Longitude</p>
                                                                <p className="font-mono break-all">{selectedGuard.location.longitude}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Accuracy</p>
                                                                <p>{selectedGuard.location.accuracy} m</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Last Updated</p>
                                                                <p className="break-words">{selectedGuard.location.updated_ago}</p>
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
                                        <div className="flex items-center justify-center h-[400px] sm:h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                                            <div className="text-center p-6">
                                                <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg font-medium mb-2">
                                                    Select a guard to view location
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-500">
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

            {/* History Modal - Responsive */}
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
        </>
    )
}