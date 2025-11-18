"use client";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CalendarIcon, Phone, Clock, MapPin, Star, HomeIcon } from "lucide-react";
import { Leave } from "@/app/types/leave";
import { Card } from "../ui/card";
import { LeaveViewFoooter } from "../shared/leave-view-footer";

interface LeaveViewDialogProps {
    trigger: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    leave?: Leave | null;
}

export function LeaveViewDialog({
    trigger,
    isOpen,
    onOpenChange,
    leave,
}: LeaveViewDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="sm:max-w-[800px] w-[90vw] max-w-[90vw] mx-auto max-h-[80vh] overflow-y-auto dark:bg-gray-900 p-4 sm:p-6">
                {/* Top Header Section */}
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 sm:mb-6">
                    <Image
                        src="/images/logo.png"
                        alt="logo"
                        width={24}
                        height={24}
                        className="rounded-full"
                    />
                    <h2 className="text-xl font-semibold">Leave status</h2>
                </div>



                {/* Guard Info */}
                <Card className="p-4 m-2 dark:bg-gray-400">
                    {/* Yellow Warning Box */}
                    <span className="text-red-500">All Leave has been used</span>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3 items-center">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                                {leave?.guardName?.split(" ").map((n) => n[0]).join("") || "GN"}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {leave?.guardName || "Guard name"}
                                </h3>
                            </div>
                        </div>

                        {/* Rating + Badge */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                                <Star size={16} fill="gold" className="text-yellow-400" />
                                4.8
                            </div>

                            <span className="bg-green-200 text-green-700 text-xs px-2 py-1 rounded-md font-medium">
                                Has a mission
                            </span>
                        </div>
                    </div>

                    {/* Info List */}
                    <div className="mt-5 space-y-3 text-gray-700 text-sm">

                        <div className="flex gap-3 flex-row justify-between">
                            <div className="flex gap-2 items-center"> <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="14" cy="14" r="14" fill="#74CAFF" />
                                <path d="M20.0297 10.1153L15.7097 7.09276C14.5322 6.26776 12.7247 6.31276 11.5922 7.19026L7.83469 10.1228C7.08469 10.7078 6.49219 11.9078 6.49219 12.8528V18.0278C6.49219 19.9403 8.04469 21.5003 9.95719 21.5003H18.0422C19.9547 21.5003 21.5072 19.9478 21.5072 18.0353V12.9503C21.5072 11.9378 20.8547 10.6928 20.0297 10.1153ZM14.5622 18.5003C14.5622 18.8078 14.3072 19.0628 13.9997 19.0628C13.6922 19.0628 13.4372 18.8078 13.4372 18.5003V16.2503C13.4372 15.9428 13.6922 15.6878 13.9997 15.6878C14.3072 15.6878 14.5622 15.9428 14.5622 16.2503V18.5003Z" fill="white" />
                            </svg>
                                Mission / Post Name</div> <span>Site / client name</span>
                        </div>

                        <div className="flex gap-3 flex-row justify-between">
                            <span>Phone number:</span> <span>+1 2622 225 233</span>
                        </div>

                        <div className="flex gap-3 flex-row justify-between">
                            <span>Leave type:</span> <span>{leave?.leaveType || "Incentive Leave"}</span>
                        </div>

                        <div className="flex gap-3 flex-row justify-between">
                            <span>Calculation unit:</span> <span>{leave?.calculationUnit || "Hourly"}</span>
                        </div>

                        <div className="flex gap-3 flex-row justify-between">
                            <span>Amount (number):</span> <span>{leave?.amount || "6"}h</span>
                        </div>

                        <div className="flex gap-3 flex-row justify-between">
                            <span>Start Date:</span> <span>{leave?.startDate || "14/08/2025"}</span>
                        </div>

                        <div className="flex gap-3 flex-row justify-between">
                            <span>Start Time:</span> <span>{leave?.startTime || "04:58"}</span>
                        </div>

                        <div className="flex gap-3 flex-row justify-between">
                            <span>End Date:</span> <span>{leave?.endDate || "14/08/2025"}</span>
                        </div>
                    </div>
                </Card>



                {/* Action Buttons */}
                <div className="">
                    <LeaveViewFoooter/>
                </div>
            </DialogContent>
        </Dialog>
    );
}
