"use client";

import Image from "next/image";
import { ChevronRight, MoreHorizontal, PlusIcon, Search, AlertCircle, CheckCircle, Loader, Coffee, Circle } from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { JSX } from "react/jsx-dev-runtime";
import { IconCar, IconCircleFilled, IconClock } from "@tabler/icons-react";

// 🧠 Mock data
const requests = [
    { id: 1, name: "Annette Black", mission: "Mission 1", status: "SOS", avatar: "/images/avatar.png" },
    { id: 2, name: "Annette Black", mission: "Mission 2", status: "On Duty", avatar: "/images/avatar.png" },
    { id: 3, name: "Annette Black", mission: "Mission 3", status: "On Way", avatar: "/images/avatar.png" },
    { id: 4, name: "Annette Black", mission: "Mission 4", status: "On Break", avatar: "/images/avatar.png" },
    { id: 5, name: "Annette Black", mission: "Mission 3", status: "On Way", avatar: "/images/avatar.png" },
];

// 🏷️ Status badge color map
const statusColors: Record<string, string> = {
    SOS: "bg-red-100 text-red-800",
    "On Duty": "bg-green-100 text-green-800",
    "On Way": "bg-blue-100 text-blue-800",
    "On Break": "bg-gray-100 text-gray-800",
};

// 🖼 Status icon map
const statusIcons: Record<string, JSX.Element> = {
    SOS: <IconCircleFilled className="w-4 h-4 text-red-500" />,
    "On Duty": <IconCircleFilled className="w-4 h-4 text-green-500" />,
    "On Way": <IconCar className="w-4 h-4 text-blue-500 animate-spin" />,
    "On Break": <IconClock className="w-4 h-4 text-gray-500" />,
};

export function OnGoingShifts() {
    return (
        <Card className="shadow-sm rounded-2xl pt-2">
            <CardHeader className="flex flex-row items-center justify-between mt-2">
                <CardTitle>
                    <div className="flex flex-col items-start gap-2">
                        <span className="font-bold text-lg">Ongoing Shifts</span>
                        <span className="text-sm text-gray-500">121 Ongoing Shifts</span>
                    </div>
                </CardTitle>
                <Button variant="link" className="text-sm text-black-600 font-medium">
                    <PlusIcon />
                </Button>
            </CardHeader>

            <CardContent className="p-2">
                <div className="overflow-x-auto">
                    <Table>
                        <TableBody>
                            {requests.map((req) => (
                                <TableRow key={req.id} className="hover:bg-gray-500">
                                    {/* Client Info */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                <Image
                                                    src={req.avatar}
                                                    alt={req.name}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{req.name}</div>
                                                <div className="text-gray-500 dark:text-gray-300 text-xs">{req.mission}</div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Status + Icon */}
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-center justify-end gap-2">
                                            {statusIcons[req.status]}
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}
                                            >
                                                {req.status}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    

                </div>
                <Button className="w-full mt-2" variant="outline">View All</Button>
            </CardContent>
        </Card>
    );
}
