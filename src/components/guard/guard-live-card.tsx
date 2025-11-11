import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { StarIcon, ChevronRight, ChevronDown, MessageCircle, AlertTriangle, AlertCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "../ui/button"
import { Alert, AlertDescription } from "../ui/alert"
import { useState } from "react"

interface GuardLiveCardProps {
    guard: {
        id: string
        name: string
        avatar: string
        rating: number
        status: 'on-duty' | 'off-duty' | 'break'
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
    }
    isExpanded: boolean
    onViewDetails: () => void
    onSendAlert:()=>void
}

export function GuardLiveCard({ guard, isExpanded, onViewDetails,onSendAlert }: GuardLiveCardProps) {
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState("")

    const statusColors = {
        'on-duty': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-600' },
        'off-duty': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', dot: 'bg-red-600' },
        'break': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-600' }
    }

    const statusText = {
        'on-duty': 'On Duty',
        'off-duty': 'Off Duty',
        'break': 'On Break'
    }

    const colors = statusColors[guard.status]



    return (
        <Card className={`w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200`}>
            <CardContent className="p-3">
                {/* Alert Display */}
                {showAlert && (
                    <Alert className="mb-3 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-800 dark:text-red-300">
                            {alertMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Header Section */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                            <Image
                                src={guard.avatar}
                                alt={`${guard.name} avatar`}
                                width={24}
                                height={24}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{guard.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <StarIcon size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-gray-600 dark:text-white">{guard.rating}</span>
                        </div>
                        <div className={`flex items-center gap-1 ${colors.bg} ${colors.text} rounded px-1.5 py-0.5`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></div>
                            <span className="text-xs font-medium">{statusText[guard.status]}</span>
                        </div>
                    </div>
                </div>

                {/* Mission Information */}
                <div className="space-y-2">
                    {/* Mission/Post and Site/Client */}
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{guard.mission}</p>
                        <p className="text-gray-600 dark:text-gray-300 text-xs">{guard.site}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Address:</span>
                            <span className="text-gray-900 dark:text-white text-right">{guard.address}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Start & End:</span>
                            <span className="text-gray-900 dark:text-white">{guard.startTime} – {guard.endTime}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Last Location Update:</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">{guard.lastUpdate}</span>
                        </div>

                        {/* Expanded Details - Same design as above */}
                        {isExpanded && (
                            <>
                                {/* Additional fields in the same design pattern */}
                                {guard.idNumber && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">ID number:</span>
                                        <span className="text-gray-900 dark:text-white">{guard.idNumber}</span>
                                    </div>
                                )}

                                {guard.phone && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Phone number:</span>
                                        <span className="text-gray-900 dark:text-white">{guard.phone}</span>
                                    </div>
                                )}

                                {guard.email && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Email:</span>
                                        <span className="text-gray-900 dark:text-white">{guard.email}</span>
                                    </div>
                                )}

                                {guard.totalShifts && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Total shifts:</span>
                                        <span className="text-gray-900 dark:text-white">{guard.totalShifts}</span>
                                    </div>
                                )}

                                {guard.checkIn && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Check in:</span>
                                        <span className="text-gray-900 dark:text-white">{guard.checkIn}</span>
                                    </div>
                                )}

                                {/* Notes in the same design pattern */}
                                {guard.notes && guard.notes.length > 0 && (
                                    <div className="mb-4">
                                        {guard.notes.map((note, index) => (
                                            <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-yellow-800 dark:text-yellow-300">{note}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Button 
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Send a message
                                    </Button>
                                    <Button 
                                        onClick={onSendAlert}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        Send alert
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Action Row */}
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Mission report</span>
                            <button
                                onClick={onViewDetails}
                                className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs transition-colors"
                            >
                                {isExpanded ? 'Show Less' : 'View Detail'}
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}