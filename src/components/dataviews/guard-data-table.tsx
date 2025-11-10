"use client";

import Image from "next/image";
import { ChevronRight, DownloadIcon, Ellipsis, EllipsisIcon, EllipsisVertical, FilterIcon, ListFilter, MoreHorizontal, Search, StarIcon } from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";


const guards = [
    {
        id: 1,
        name: "John Smith",
        _id: "#GRD-0007",
        idNumber: "15511021",
        type: "Corporate",
        cardNumber: "15511021",
        phoneNumber: "+12635825",
        driverLicenseNumber: "123 568 223",
        issuingState: "California",
        city: "Los Angeles",
        checkInTime: "09:40 PM",
        status: "On Duty",
        locationRating: "4.8",
        locationIcon: "🚠️",
        avatar: "/images/avatar.png"
    },
    {
        id: 2,
        name: "Maria Garcia",
        _id: "#GRD-0008",
        idNumber: "15511022",
        type: "Unarmed",
        cardNumber: "15511022",
        phoneNumber: "+12635826",
        driverLicenseNumber: "123 568 224",
        issuingState: "Texas",
        city: "Houston",
        checkInTime: "10:00 PM",
        status: "Day off",
        locationRating: "4.7",
        locationIcon: "🚠️",
        avatar: "/images/avatar.png"
    },
    {
        id: 3,
        name: "Robert Johnson",
        _id: "#GRD-0009",
        idNumber: "15511023",
        type: "Armed",
        cardNumber: "15511023",
        phoneNumber: "+12635827",
        driverLicenseNumber: "123 568 225",
        issuingState: "Florida",
        city: "Miami",
        checkInTime: "10:00 PM",
        status: "In Progress (PhotoPending)",
        locationRating: "4.9",
        locationIcon: "🚠️",
        avatar: "/images/avatar.png"
    },
    {
        id: 4,
        name: "Sarah Williams",
        _id: "#GRD-0010",
        idNumber: "15511024",
        type: "Corporate",
        cardNumber: "15511024",
        phoneNumber: "+12635828",
        driverLicenseNumber: "123 568 226",
        issuingState: "New York",
        city: "Brooklyn",
        checkInTime: "10:00 PM",
        status: "Late (Arrived 12:11 AM)",
        locationRating: "4.6",
        locationIcon: "🚠️",
        avatar: "/images/avatar.png"
    },
    {
        id: 5,
        name: "Michael Brown",
        _id: "#GRD-0011",
        idNumber: "15511025",
        type: "Armed",
        cardNumber: "15511025",
        phoneNumber: "+12635829",
        driverLicenseNumber: "123 568 227",
        issuingState: "Illinois",
        city: "Chicago",
        checkInTime: "Missed Check-In",
        status: "Missed Check-In",
        locationRating: "4.5",
        locationIcon: "🚠️",
        avatar: "/images/avatar.png"
    },
    {
        id: 6,
        name: "Jennifer Davis",
        _id: "#GRD-0012",
        idNumber: "15511026",
        type: "Armed",
        cardNumber: "15511026",
        phoneNumber: "+12635830",
        driverLicenseNumber: "123 568 228",
        issuingState: "Arizona",
        city: "Phoenix",
        checkInTime: "11:00 PM",
        status: "Off Duty",
        locationRating: "4.8",
        locationIcon: "🚠️",
        avatar: "/images/avatar.png"
    },
    {
        id: 7,
        name: "David Miller",
        _id: "#GRD-0013",
        idNumber: "15511027",
        type: "Corporate",
        cardNumber: "15511027",
        phoneNumber: "+12635831",
        driverLicenseNumber: "123 568 229",
        issuingState: "Nevada",
        city: "Las Vegas",
        checkInTime: "08:30 PM",
        status: "On Duty",
        locationRating: "4.9",
        locationIcon: "🚠️",
        avatar: "/images/avatar.png"
    },
    {
        id: 8,
        name: "Lisa Wilson",
        _id: "#GRD-0014",
        idNumber: "15511028",
        type: "Unarmed",
        cardNumber: "15511028",
        phoneNumber: "+12635832",
        driverLicenseNumber: "123 568 230",
        issuingState: "Washington",
        city: "Seattle",
        checkInTime: "09:15 PM",
        status: "On Duty",
        locationRating: "4.7",
        locationIcon: "🚠️",
        avatar: "/images/avatar.png"
    },
    {
        id: 9,
        name: "James Taylor",
        _id: "#GRD-0015",
        idNumber: "15511029",
        type: "Armed",
        cardNumber: "15511029",
        phoneNumber: "+12635833",
        driverLicenseNumber: "123 568 231",
        issuingState: "Colorado",
        city: "Denver",
        checkInTime: "10:45 PM",
        status: "In Progress (PhotoPending)",
        locationRating: "4.6",
        locationIcon: "🚠️",
        avatar: "/images/avatar.png"
    },
    {
        id: 10,
        name: "Emily Anderson",
        _id: "#GRD-0016",
        idNumber: "15511030",
        type: "Corporate",
        cardNumber: "15511030",
        phoneNumber: "+12635834",
        driverLicenseNumber: "123 568 232",
        issuingState: "Georgia",
        city: "Atlanta",
        checkInTime: "09:00 PM",
        status: "On Duty",
        locationRating: "4.8",
        locationIcon: "🚠️",
        avatar: "/images/avatar.png"
    }
];

const typeColors:Record<string, string> = {
    Corporate: "bg-blue-100 text-blue-800",
    Unarmed: "bg-gray-100 text-gray-800",
    Armed: "bg-red-100 text-red-800"
};

const statusColors:Record<string, string> = {
    "On Duty": "bg-green-100 text-green-800",
    "Day off": "bg-gray-100 text-gray-800",
    "In Progress (PhotoPending)": "bg-yellow-100 text-yellow-800",
    "Late (Arrived 12:11 AM)": "bg-orange-100 text-orange-800",
    "Missed Check-In": "bg-red-100 text-red-800",
    "Off Duty": "bg-gray-100 text-gray-800"
};

export function GuardDataTable() {
    return (
        <Card className="shadow-sm rounded-2xl">
            <div className="bg-[#F4F6F8] p-5 -mt-6 rounded-t-md flex flex-row items-center gap-4 w-full justify-between md:justify-start">
                <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
                    <ListFilter size="14px" />
                    Filters
                </CardTitle>

                <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
                    <DownloadIcon size="14px" />
                    Export
                </CardTitle>

                <CardTitle className="text-sm flex items-center gap-1 dark:text-black">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Select</Label>
                </CardTitle>
            </div>

            <CardContent className="p-0">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b px-4 pb-3">
                    {/* Search Input: 8 columns on sm+ screens */}
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="Guard Name..." />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="Id Number..." />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="Phone Number..." />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="sm:col-span-3">
                        <InputGroup>
                            <InputGroupInput placeholder="Driver Licence Number..." />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>

                    {/* Status Select: 4 columns on sm+ screens */}
                    <div className="sm:col-span-3">
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>All</SelectLabel>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In progress</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="sm:col-span-3">
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>All</SelectLabel>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In progress</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="sm:col-span-3">
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>All</SelectLabel>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In progress</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="sm:col-span-3">
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>All</SelectLabel>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In progress</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>


                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Guard Name</TableHead>
                                <TableHead>ID Number</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Card Number</TableHead>
                                <TableHead>Phone Number</TableHead>
                                <TableHead>Driver License Number</TableHead>
                                <TableHead>Issuing State</TableHead>
                                <TableHead>City of Residence</TableHead>
                                <TableHead>Check-In</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Location</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {guards.map((guard) => (
                                <TableRow key={guard.id} className="hover:bg-gray-50 dark:hover:bg-black">
                                    {/* Guard Name */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                <Image
                                                    src={guard.avatar}
                                                    alt={guard.name}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{guard.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* ID Number */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">{guard._id}</TableCell>

                                    {/* Type */}
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[guard.type]}`}>
                                            {guard.type}
                                        </span>
                                    </TableCell>

                                    {/* Card Number */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">{guard.cardNumber}</TableCell>

                                    {/* Phone Number */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">{guard.phoneNumber}</TableCell>

                                    {/* Driver License Number */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">{guard.driverLicenseNumber}</TableCell>

                                    {/* Issuing State */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">{guard.issuingState}</TableCell>

                                    {/* City of Residence */}
                                    <TableCell className="text-gray-700 dark:text-gray-300">{guard.city}</TableCell>

                                    {/* Check-In */}
                                    <TableCell>
                                        <div className="font-medium text-gray-900">{guard.checkInTime}</div>
                                        {guard.checkInTime && (
                                            <div className="text-gray-500 dark:text-gray-300 text-xs">{guard.checkInTime}</div>
                                        )}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[guard.status]}`}>
                                            {guard.status}
                                        </span>
                                    </TableCell>

                                    {/* Location + Actions */}
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2"><StarIcon size="14px"/> {guard.locationRating}</span>
                                            <span>{guard.locationIcon}</span>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <EllipsisVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View details</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit guard</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
