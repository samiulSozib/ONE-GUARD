import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarIcon, ChevronRight, ChevronDown, MessageCircle, AlertTriangle, AlertCircle, MapPin, Building, Clock, Phone, Mail } from "lucide-react"
import Image from "next/image"
import { Button } from "../ui/button"
import { Alert, AlertDescription } from "../ui/alert"
import { useState } from "react"
import { IconCar } from "@tabler/icons-react"

interface GuardLiveCardProps {
    guard: {
        id: string
        name: string
        avatar: string
        rating: number
        status: string  // Changed from union type to string
        displayStatus: string
        mission: string
        site: string
        address: string
        startTime: string
        endTime: string
        lastUpdate: string
        phone?: string
        email?: string
        idNumber?: string
        totalShifts?: number
        checkIn?: string
        notes?: string[]
        coordinates?: { lat: number; lng: number }
        siteDetails?: {
            name?: string
            address?: string
            instructions?: string
            guardsRequired?: number
            locations?: Array<{
                title: string
                description?: string
                latitude: number
                longitude: number
                is_active?: boolean
            }>
        }
        dutyDetails?: {
            name?: string
            startTime?: string
            endTime?: string
            status?: string
        }
    }
    isExpanded: boolean
    onViewDetails: () => void
    onSendAlert: () => void
}

export function GuardLiveCard({ guard, isExpanded, onViewDetails, onSendAlert }: GuardLiveCardProps) {
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState("")

    const getStatusColors = (status: string) => {
        switch (status) {
            case 'on-duty':
                return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-600' };
            case 'off-duty':
                return { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-300', dot: 'bg-gray-600' };
            case 'break':
                return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-600' };
            default:
                return { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-300', dot: 'bg-gray-600' };
        }
    }

    const colors = getStatusColors(guard.status)
    const primaryLocation = guard.siteDetails?.locations?.[0]

    return (
        <Card className="w-full border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 hover:shadow-md">
            <CardContent className="p-4">
                {showAlert && (
                    <Alert className="mb-3 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-800 dark:text-red-300">
                            {alertMessage}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                            <Image
                                src={guard.avatar}
                                alt={`${guard.name} avatar`}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <span className="font-semibold text-gray-900 dark:text-white block">
                                {guard.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {guard.idNumber}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <StarIcon size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm text-gray-600 dark:text-white">{guard.rating}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${colors.bg} ${colors.text} rounded-full px-2 py-1`}>
                            <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
                            <span className="text-xs font-medium">{guard.displayStatus}</span>
                            {guard.displayStatus === 'Online' && (
                                <div className="animate-pulse">
                                    <IconCar className="w-4 h-4 text-green-500 animate-spin" />
                                </div>
                            )}
                            {guard.displayStatus === 'Offline' && (
                                <div className="">
                                    <IconCar className="w-4 h-4 text-gray-500" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-blue-600" />
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{guard.mission}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {guard.site}
                        </Badge>
                    </div>

                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{guard.address}</p>
                            {primaryLocation && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Location: {primaryLocation.title}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500">Start</p>
                                <p className="text-sm font-medium">{guard.startTime}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500">End</p>
                                <p className="text-sm font-medium">{guard.endTime}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Last Update: {guard.lastUpdate}</span>
                        <Badge className={guard.checkIn !== 'Not checked in' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {guard.checkIn}
                        </Badge>
                    </div>

                    {isExpanded && (
                        <div className="space-y-4 mt-4 pt-4 border-t dark:border-gray-700">
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Contact Information</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {guard.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">{guard.phone}</span>
                                        </div>
                                    )}
                                    {guard.email && (
                                        <div className="flex items-center gap-2 col-span-2">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm truncate">{guard.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {guard.siteDetails && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Site Details</h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
                                        <p className="text-sm">
                                            <span className="text-gray-500">Guards Required:</span>{' '}
                                            <span className="font-medium">{guard.siteDetails.guardsRequired || 0}</span>
                                        </p>
                                        {guard.siteDetails.instructions && (
                                            <p className="text-sm">
                                                <span className="text-gray-500">Instructions:</span>{' '}
                                                <span className="text-gray-700 dark:text-gray-300">{guard.siteDetails.instructions}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {guard.notes && guard.notes.length > 0 && (
                                <div className="space-y-2">
                                    {guard.notes.map((note, index) => (
                                        <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-yellow-800 dark:text-yellow-300">{note}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    Message
                                </Button>
                                <Button
                                    onClick={onSendAlert}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Send Alert
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={onViewDetails}
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                        >
                            {isExpanded ? 'Show Less' : 'View Details'}
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}