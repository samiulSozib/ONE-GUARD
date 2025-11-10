'use client'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ReactNode, useState } from 'react'
import Image from "next/image"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { SearchIcon, MapPin, Phone, Mail, Calendar, Clock, AlertCircle, MessageCircle, AlertTriangle } from "lucide-react"
import { GuardLiveCard } from "../cards/guard-live-card"
import { Card, CardContent, CardHeader } from "../ui/card"
import { useAlert } from "../contexts/AlertContext"

interface LiveMapDialogProps {
    trigger: ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

// Enhanced mock data array for guards
const guardsData = [
    {
        id: "1",
        name: "John Smith",
        avatar: "/images/avatar.png",
        rating: 4.8,
        status: "on-duty" as const,
        mission: "Central Park Patrol",
        site: "Park Security Inc.",
        address: "58 Park Avenue, New York, NY 10016, USA",
        startTime: "10:00 PM",
        endTime: "6:00 AM",
        lastUpdate: "2h ago",
        phone: "+1 (562) 168-4567",
        email: "john.smith@gmail.com",
        idNumber: "#GRD-0001",
        totalShifts: 12,
        checkIn: "10/28/2024 - 09:45 pm",
        notes: ["Delay in sending the report (approximately 2 hours)"],
        coordinates: { lat: 40.7851, lng: -73.9683 },
        noteDetails: {
            title: "Note",
            content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            timestamps: [
                "09:01 10/28/2025",
                "09:01 10/28/2025",
                "09:01 10/28/2025",
                "09:01 10/28/2025",
                "09:01 10/28/2025",
                "09:01 10/28/2025"
            ]
        }
    },
    {
        id: "2",
        name: "Maria Garcia",
        avatar: "/images/avatar.png",
        rating: 4.9,
        status: "on-duty" as const,
        mission: "Financial District Patrol",
        site: "Metro Security",
        address: "Wall Street, New York, NY 10005, USA",
        startTime: "9:00 PM",
        endTime: "5:00 AM",
        lastUpdate: "5 min ago",
        phone: "+1 (555) 234-5678",
        email: "maria.garcia@gmail.com",
        idNumber: "#GRD-0002",
        totalShifts: 18,
        checkIn: "10/28/2024 - 08:45 pm",
        notes: [],
        coordinates: { lat: 40.7061, lng: -74.0089 },
        noteDetails: {
            title: "Note",
            content: "Maria has been performing exceptionally well in the financial district patrol. She has shown great attention to detail and has successfully handled several security situations with professionalism.",
            timestamps: [
                "14:30 10/28/2025",
                "14:30 10/28/2025",
                "14:30 10/28/2025",
                "14:30 10/28/2025",
                "14:30 10/28/2025",
                "14:30 10/28/2025"
            ]
        }
    },
    {
        id: "3",
        name: "David Wilson",
        avatar: "/images/avatar.png",
        rating: 4.7,
        status: "break" as const,
        mission: "Residential Complex Security",
        site: "HomeSafe Security",
        address: "Upper East Side, New York, NY 10028, USA",
        startTime: "11:00 PM",
        endTime: "7:00 AM",
        lastUpdate: "10 min ago",
        phone: "+1 (555) 345-6789",
        email: "david.wilson@gmail.com",
        idNumber: "#GRD-0003",
        totalShifts: 15,
        checkIn: "10/28/2024 - 10:45 pm",
        notes: ["On scheduled break"],
        coordinates: { lat: 40.7736, lng: -73.9566 },
        noteDetails: {
            title: "Note",
            content: "David is currently on his scheduled break. He has been maintaining regular patrol routes and all checkpoints have been cleared on time.",
            timestamps: [
                "11:45 10/28/2025",
                "11:45 10/28/2025",
                "11:45 10/28/2025",
                "11:45 10/28/2025",
                "11:45 10/28/2025",
                "11:45 10/28/2025"
            ]
        }
    },
    {
        id: "4",
        name: "Sarah Johnson",
        avatar: "/images/avatar.png",
        rating: 4.6,
        status: "off-duty" as const,
        mission: "Shopping Mall Security",
        site: "Retail Guard Services",
        address: "5th Avenue, New York, NY 10022, USA",
        startTime: "8:00 PM",
        endTime: "4:00 AM",
        lastUpdate: "1 hour ago",
        phone: "+1 (555) 456-7890",
        email: "sarah.johnson@gmail.com",
        idNumber: "#GRD-0004",
        totalShifts: 20,
        checkIn: "10/27/2024 - 07:45 pm",
        notes: ["Shift completed successfully"],
        coordinates: { lat: 40.7614, lng: -73.9776 },
        noteDetails: {
            title: "Note",
            content: "Sarah completed her shift successfully. All reports have been submitted and the handover to the morning shift was completed without issues.",
            timestamps: [
                "04:15 10/28/2025",
                "04:15 10/28/2025",
                "04:15 10/28/2025",
                "04:15 10/28/2025",
                "04:15 10/28/2025",
                "04:15 10/28/2025"
            ]
        }
    }
]

export function GuardLiveMap({ trigger, isOpen, onOpenChange }: LiveMapDialogProps) {
    const [selectedGuard, setSelectedGuard] = useState<string | null>("")
    const [expandedCard, setExpandedCard] = useState<string | null>("")
    const activeGuards = guardsData.filter(guard => guard.status === 'on-duty')
    const { showAlert } = useAlert()

    const handleViewDetails = (guardId: string) => {
        setExpandedCard(expandedCard === guardId ? null : guardId)
        setSelectedGuard(guardId)
    }

    const selectedGuardData = guardsData.find(guard => guard.id === selectedGuard)

     const handleSendAlert = (guardName: string) => {
        showAlert(`Alert sent successfully to ${guardName}`, 'success')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1400px] w-[95vw] max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-900">
                <div className="flex flex-row items-start gap-2">
                    <Image
                        src="/images/logo.png"
                        width={36}
                        height={36}
                        alt="Company logo"
                    />
                    <Select value={selectedGuard || ""} onValueChange={setSelectedGuard}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a guard" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Guards</SelectLabel>
                                {guardsData.map(guard => (
                                    <SelectItem key={guard.id} value={guard.id}>
                                        {guard.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <InputGroup className="w-fit">
                        <InputGroupInput
                            placeholder="Search guards..."
                            className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        />
                        <InputGroupAddon className="bg-[#5F0015] p-2 rounded-r-md" align="inline-end">
                            <SearchIcon className="text-white" />
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
                        {/* Left Column - 5/12 (Guards List) */}
                        <div className="lg:col-span-5 order-2 lg:order-1">
                            <div className="flex flex-col gap-1 sm:gap-2 mb-2 sm:mb-3">
                                <span className="text-black dark:text-white font-semibold text-sm sm:text-base">
                                    {activeGuards.length} active guards
                                </span>
                                <span className="text-black dark:text-white font-bold text-xl sm:text-2xl">
                                    Guards in New York
                                </span>
                            </div>

                            {/* Guards List */}
                            <div className="space-y-2 sm:space-y-3 max-h-[500px] overflow-y-auto">
                                {guardsData.map(guard => (
                                    <GuardLiveCard
                                        key={guard.id}
                                        guard={guard}
                                        isExpanded={expandedCard === guard.id}
                                        onViewDetails={() => handleViewDetails(guard.id)}
                                        onSendAlert={()=>handleSendAlert(guard.name)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Right Column - 7/12 (Map & Detailed View) */}
                        <div className="lg:col-span-7 order-1 lg:order-2">
                            <div className="flex flex-col gap-4">
                                {/* Show Note Section when guard is expanded, otherwise show Map */}
                                {expandedCard ? (
                                    <div className="">
                                        {/* Note Header */}
                                        <Card className="mb-4 p-2">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                                {selectedGuardData?.noteDetails?.title || "Note"}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {selectedGuardData?.noteDetails?.content || "No note available."}
                                            </p>
                                        </Card>

                                        {/* Timestamps Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                                            {selectedGuardData?.noteDetails?.timestamps.map((timestamp, index) => {
                                                // Split the timestamp into time and date parts
                                                const [time, date] = timestamp.split(' ');
                                                return (
                                                    <div
                                                        key={index}
                                                        className="text-center dark:bg-gray-700 rounded-lg border dark:border-gray-600"
                                                    >
                                                        <CardContent className="p-2">
                                                            <div className="flex flex-row justify-between items-center space-y-1">
                                                                <span className="text-black dark:text-white font-bold text-lg">{time}</span>
                                                                <span className="text-gray-600 dark:text-gray-300 text-sm">{date}</span>
                                                            </div>
                                                            <div className="flex justify-center mt-2">
                                                                <Image
                                                                    src="/images/rectangle.png"
                                                                    alt="Rectangle"
                                                                    height={80}
                                                                    width={120}
                                                                    className="w-full h-32 object-cover rounded"
                                                                />
                                                            </div>
                                                        </CardContent>
                                                    </div>
                                                );
                                            })}
                                        </div>


                                    </div>
                                ) : (
                                    <>
                                        {/* Map Section - Only shown when no guard is expanded */}
                                        <div className="flex items-center justify-center h-[300px] sm:h-[350px] md:h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700 relative">
                                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                                Select a guard to view their location
                                            </p>
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