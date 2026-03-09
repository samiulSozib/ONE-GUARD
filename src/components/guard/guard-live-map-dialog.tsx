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
import { SearchIcon, MapPin, Phone, Mail, Calendar, Clock, AlertCircle, MessageCircle, AlertTriangle, User, Building, CheckCircle, Navigation } from "lucide-react"
import { GuardLiveCard } from "./guard-live-card"
import { Card, CardContent } from "../ui/card"
import { useAlert } from "../contexts/AlertContext"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { fetchAssignments } from "@/store/slices/guardAssignmentSlice"
import { GuardAssignment } from "@/app/types/guardAssignment"
import { Badge } from "../ui/badge"

interface LiveMapDialogProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
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
    const { assignments, isLoading } = useAppSelector((state) => state.guardAssignment)
    const [selectedGuard, setSelectedGuard] = useState<string>("")
    const [expandedCard, setExpandedCard] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState("")
    const { showAlert } = useAlert()

    // Map states
    const [mapLoaded, setMapLoaded] = useState(false)
    const [mapError, setMapError] = useState<string | null>(null)
    const mapRef = useRef<HTMLDivElement>(null)
    const googleMapRef = useRef<google.maps.Map | null>(null)
    const markerRef = useRef<google.maps.Marker | null>(null)
    const scriptRef = useRef<HTMLScriptElement | null>(null)

    // Load Google Maps script
    useEffect(() => {
        // Don't do anything if script is already loaded or loading
        if (window.google?.maps) {
            queueMicrotask(() => {
                setMapLoaded(true)
            })

            return
        }

        // Check if script is already being loaded
        if (scriptRef.current) return

        // Create and load script
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

        // Cleanup
        return () => {
            if (scriptRef.current) {
                document.head.removeChild(scriptRef.current)
                scriptRef.current = null
            }
        }
    }, [])

    // Fetch assignments when dialog opens
    useEffect(() => {
        if (isOpen) {
            console.log("fdfd")
            dispatch(fetchAssignments({
                include_guard: true,
                include_duty: true,
                //status: 'checked_in,on_duty', // Try this format

                per_page: 50
            }))
        }
    }, [dispatch, isOpen])

    // Filter assignments to get only checked_in and on_duty guards
    // const activeAssignments = assignments.filter(assignment =>
    //     assignment.status === 'checked_in' || assignment.status === 'on_duty'
    // )

    // Filter guards based on search
    const filteredAssignments = assignments.filter(assignment => {
        const guardName = assignment.guard?.full_name?.toLowerCase() || ''
        const siteName = assignment.duty?.site_location?.site?.site_name?.toLowerCase() || ''
        const locationTitle = assignment.duty?.site_location?.title?.toLowerCase() || ''
        const searchLower = searchTerm.toLowerCase()

        return guardName.includes(searchLower) ||
            siteName.includes(searchLower) ||
            locationTitle.includes(searchLower)
    })

    const handleViewDetails = (guardId: string) => {
        setExpandedCard(expandedCard === guardId ? "" : guardId)
        setSelectedGuard(guardId)
        setMapError(null) // Reset map error when switching guards
    }

    const selectedAssignment = assignments.find(a => a.guard_id.toString() === selectedGuard)

    // Initialize map when location changes and map is loaded
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || !selectedAssignment?.duty?.site_location || !window.google?.maps) return

        try {
            const siteLocation = selectedAssignment.duty.site_location
            const location: google.maps.LatLngLiteral = {
                lat: Number(siteLocation.latitude),
                lng: Number(siteLocation.longitude),
            }

            // Check if coordinates are valid (not 0,0)
            if (location.lat === 0 && location.lng === 0) {
                queueMicrotask(() => {
                    setMapError('Invalid coordinates for this location')
                })

                return
            }

            if (!googleMapRef.current) {
                googleMapRef.current = new window.google.maps.Map(mapRef.current, {
                    center: location,
                    zoom: 18,
                    mapTypeControl: true,
                    streetViewControl: true,
                    fullscreenControl: true,
                })

                markerRef.current = new window.google.maps.Marker({
                    position: location,
                    map: googleMapRef.current,
                    title: siteLocation.title,
                    animation: window.google.maps.Animation.DROP,
                })
            } else {
                googleMapRef.current.setCenter(location)
                googleMapRef.current.setZoom(18)

                if (markerRef.current) {
                    markerRef.current.setPosition(location)
                    markerRef.current.setTitle(siteLocation.title)
                } else {
                    markerRef.current = new window.google.maps.Marker({
                        position: location,
                        map: googleMapRef.current,
                        title: siteLocation.title,
                        animation: window.google.maps.Animation.DROP,
                    })
                }
            }
            queueMicrotask(() => {
                setMapError(null)
            })

        } catch (err) {
            console.error('Error initializing map:', err)
            queueMicrotask(() => {
                setMapError("Failed to initialize map")
            })
        }
    }, [mapLoaded, selectedGuard, selectedAssignment])



    const handleSendAlert = (guardName: string) => {
        showAlert(`Alert sent successfully to ${guardName}`, 'success')
    }

    // Transform assignment data to match GuardLiveCard props
    const transformAssignmentToGuardProps = (assignment: GuardAssignment) => {
        const guard = assignment.guard
        const duty = assignment.duty
        const siteLocation = duty?.site_location
        const site = siteLocation?.site

        return {
            id: assignment.guard_id.toString(),
            name: guard?.full_name || 'Unknown Guard',
            avatar: guard?.profile_image ?
                `/${guard.profile_image}` :
                '/images/avatar.png',
            rating: 4.5,
            status: formatGuardStatus(assignment.status),
            displayStatus: getStatusDisplayText(assignment.status),
            mission: duty?.title || 'No mission assigned',
            site: site?.site_name || 'No site assigned',
            locationTitle: siteLocation?.title || '',
            address: siteLocation ?
                `${siteLocation.title} - ${siteLocation.latitude}, ${siteLocation.longitude}` :
                site?.address || 'Address not available',
            startTime: duty?.start_datetime ? new Date(duty.start_datetime).toLocaleTimeString() : 'N/A',
            endTime: duty?.end_datetime ? new Date(duty.end_datetime).toLocaleTimeString() : 'N/A',
            lastUpdate: assignment.created_at ?
                `${Math.floor((new Date(assignment.created_at).getTime()) / 60000)} min ago` :
                'N/A',
            phone: guard?.phone || 'N/A',
            email: guard?.email || 'N/A',
            idNumber: guard?.guard_code || `#GRD-${String(assignment.guard_id).padStart(4, '0')}`,
            totalShifts: 0, // You might want to calculate this from somewhere
            checkIn: assignment.status === 'checked_in' ?
                new Date().toLocaleString() : 'Not checked in',
            notes: assignment.status === 'late' ? ['Guard is running late'] : [],
            coordinates: siteLocation &&
                Number(siteLocation.latitude) !== 0 &&
                Number(siteLocation.longitude) !== 0 ? {
                lat: Number(siteLocation.latitude),
                lng: Number(siteLocation.longitude)
            } : undefined,
            siteDetails: {
                name: site?.site_name,
                address: site?.address,
                instructions: site?.site_instruction,
                guardsRequired: site?.guards_required,
            },
            locationDetails: siteLocation ? {
                id: siteLocation.id,
                title: siteLocation.title,
                description: siteLocation.description,
                latitude: Number(siteLocation.latitude),
                longitude: Number(siteLocation.longitude),
                is_active: siteLocation.is_active,
                // contract_specific_instructions: siteLocation.contract_specific_instructions
            } : undefined,
            dutyDetails: {
                id: duty?.id,
                title: duty?.title,
                startTime: duty?.start_datetime,
                endTime: duty?.end_datetime,
                status: duty?.status,
                mandatory_check_in_time: duty?.mandatory_check_in_time,
                required_hours: duty?.required_hours,
                duty_type: duty?.duty_type
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1400px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900">
                {/* <div className="flex flex-row items-start gap-2 sticky top-0 bg-white dark:bg-gray-900 z-10 pb-2">
                    <Image
                        src="/images/logo.png"
                        width={36}
                        height={36}
                        alt="Company logo"
                    />
                    <Select value={selectedGuard} onValueChange={setSelectedGuard}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a guard" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Active Guards</SelectLabel>
                                {filteredAssignments.map(assignment => (
                                    <SelectItem key={assignment.guard_id} value={assignment.guard_id.toString()}>
                                        {assignment.guard?.full_name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <InputGroup className="w-fit">
                        <InputGroupInput
                            placeholder="Search guards or sites..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        />
                        <InputGroupAddon className="bg-[#5F0015] p-2 rounded-r-md" align="inline-end">
                            <SearchIcon className="text-white" />
                        </InputGroupAddon>
                    </InputGroup>

                    <div className="ml-auto flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {assignments.length} Active
                        </Badge>
                    </div>
                </div> */}

                <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
                        {/* Left Column - Guards List */}
                        <div className="lg:col-span-5 order-2 lg:order-1">
                            <div className="flex flex-col gap-1 sm:gap-2 mb-2 sm:mb-3">
                                <span className="text-black dark:text-white font-semibold text-sm sm:text-base">
                                    {filteredAssignments.length} active guards
                                </span>
                                <span className="text-black dark:text-white font-bold text-xl sm:text-2xl">
                                    Guards on Duty
                                </span>
                            </div>

                            {/* Guards List */}
                            <div className="space-y-2 sm:space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    </div>
                                ) : filteredAssignments.length > 0 ? (
                                    filteredAssignments.map(assignment => (
                                        <GuardLiveCard
                                            key={assignment.guard_id}
                                            guard={transformAssignmentToGuardProps(assignment)}
                                            isExpanded={expandedCard === assignment.guard_id.toString()}
                                            onViewDetails={() => handleViewDetails(assignment.guard_id.toString())}
                                            onSendAlert={() => handleSendAlert(assignment.guard?.full_name || 'Guard')}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No active guards found
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Map & Detailed View */}
                        <div className="lg:col-span-7 order-1 lg:order-2">
                            <div className="flex flex-col gap-4">
                                {expandedCard && selectedAssignment ? (
                                    <div className="space-y-4">
                                        {/* Location Information Card */}
                                        <Card>
                                            <CardContent className="p-4">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <MapPin className="w-5 h-5 text-blue-600" />
                                                    Current Location
                                                </h3>
                                                {selectedAssignment.duty?.site_location ? (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium">
                                                                {selectedAssignment.duty.site_location.title}
                                                            </p>
                                                            <Badge className={
                                                                selectedAssignment.duty.site_location.is_active
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }>
                                                                {selectedAssignment.duty.site_location.is_active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>

                                                        {selectedAssignment.duty.site_location.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {selectedAssignment.duty.site_location.description}
                                                            </p>
                                                        )}

                                                        {/* {selectedAssignment.duty.site_location?.contract_specific_instructions && (
                                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Instructions</p>
                                                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                                                    {selectedAssignment.duty.site_location?.contract_specific_instructions}
                                                                </p>
                                                            </div>
                                                        )} */}

                                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Latitude</p>
                                                                <p className="text-sm font-mono">
                                                                    {selectedAssignment.duty.site_location.latitude}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Longitude</p>
                                                                <p className="text-sm font-mono">
                                                                    {selectedAssignment.duty.site_location.longitude}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full mt-2"
                                                            onClick={() => {
                                                                window.open(
                                                                    `https://www.google.com/maps?q=${selectedAssignment.duty?.site_location?.latitude},${selectedAssignment.duty?.site_location?.longitude}`,
                                                                    '_blank'
                                                                )
                                                            }}
                                                        >
                                                            <Navigation className="w-4 h-4 mr-2" />
                                                            Open in Google Maps
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500">No location data available</p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Map Section */}
                                        <div
                                            ref={mapRef}
                                            className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700 relative overflow-hidden"
                                        >
                                            {mapError && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
                                                    <div className="text-center p-4">
                                                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                                        <p className="text-sm text-red-600 dark:text-red-400">{mapError}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedAssignment.duty?.site_location && !mapError && (
                                                <>
                                                    {!mapLoaded && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                                                            <div className="text-center">
                                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                                <p className="text-sm text-gray-500">Loading map...</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {!selectedAssignment.duty?.site_location && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-center p-6">
                                                        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                        <p className="text-sm text-gray-500">No location assigned for this duty</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Site Information Card */}
                                        <Card>
                                            <CardContent className="p-4">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                                    Site Details
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="col-span-2">
                                                        <p className="text-xs text-gray-500">Site Name</p>
                                                        <p className="text-sm font-medium">
                                                            {selectedAssignment.duty?.site_location?.site?.site_name || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Required Guards</p>
                                                        <p className="text-sm font-medium">
                                                            {selectedAssignment.duty?.site_location?.site?.guards_required || 0}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Status</p>
                                                        <Badge variant="outline">
                                                            {selectedAssignment.duty?.site_location?.site?.status || 'N/A'}
                                                        </Badge>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-xs text-gray-500">Address</p>
                                                        <p className="text-sm">
                                                            {selectedAssignment.duty?.site_location?.site?.address || 'N/A'}
                                                        </p>
                                                    </div>
                                                    {selectedAssignment.duty?.site_location?.site?.site_instruction && (
                                                        <div className="col-span-2">
                                                            <p className="text-xs text-gray-500">Instructions</p>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                {selectedAssignment.duty.site_location.site.site_instruction}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Assignment Timeline */}
                                        <Card>
                                            <CardContent className="p-4">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                                    Duty Schedule
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                        <span className="text-sm">Duty Title</span>
                                                        <span className="text-sm font-medium">
                                                            {selectedAssignment.duty?.title || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                        <span className="text-sm">Start Time</span>
                                                        <span className="text-sm font-medium">
                                                            {selectedAssignment.duty?.start_datetime ?
                                                                new Date(selectedAssignment.duty.start_datetime).toLocaleString() :
                                                                'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                        <span className="text-sm">End Time</span>
                                                        <span className="text-sm font-medium">
                                                            {selectedAssignment.duty?.end_datetime ?
                                                                new Date(selectedAssignment.duty.end_datetime).toLocaleString() :
                                                                'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                        <span className="text-sm">Check-in Required By</span>
                                                        <span className="text-sm font-medium">
                                                            {selectedAssignment.duty?.mandatory_check_in_time ?
                                                                new Date(selectedAssignment.duty.mandatory_check_in_time).toLocaleString() :
                                                                'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                        <span className="text-sm">Required Hours</span>
                                                        <span className="text-sm font-medium">
                                                            {selectedAssignment.duty?.required_hours || 0} hours
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                        <span className="text-sm">Assignment Status</span>
                                                        <Badge className={
                                                            selectedAssignment.status === 'checked_in' ? 'bg-green-100 text-green-800' :
                                                                selectedAssignment.status === 'on_duty' ? 'bg-blue-100 text-blue-800' :
                                                                    selectedAssignment.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                        }>
                                                            {getStatusDisplayText(selectedAssignment.status)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
                                    <>
                                        {/* Map Section when no guard selected */}
                                        <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700 relative">
                                            <div className="text-center p-6">
                                                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mb-2">
                                                    {filteredAssignments.length} guards currently on duty
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Select a guard from the list to view their location on map
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}