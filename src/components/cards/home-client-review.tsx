"use client";

import Image from "next/image";
import { Star, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ClientReviewCard() {
    return (
        <Card className="w-full md:max-w-md shadow-md rounded-2xl">
            <CardHeader className="flex flex-row gap-1 items-center justify-between">
                <div className="flex flex-col">
                    <CardTitle className="text-lg font-semibold">Client Reviews</CardTitle>
                    <CardTitle className="text-sm text-gray-500">12 Items Found</CardTitle>
                </div>
                <div className="flex flex-row gap-2">
                    <ChevronLeft/>
                    <ChevronRight/>
                </div>

            </CardHeader>

            <CardContent className="pt-2">
                {/* Client Info */}
                <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src="/images/avatar.png" alt="Kathryn Murphy" />
                        <AvatarFallback>KM</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">Kathryn Murphy</span>
                        <span className="text-xs text-gray-500">28 Jan 2025 11:22 PM</span>
                    </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-gray-300" />
                    <Star className="w-4 h-4 text-gray-300" />
                </div>

                {/* Review Text */}
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                    I hired a security guard for my birthday event. Overall, the experience was good — the guard was polite, professional,{" "}
                    <span className="text-blue-500 cursor-pointer">Show more...</span>
                </p>

                {/* Action Buttons */}
                <div className="flex xl:flex-row flex-col gap-3 mt-4">
                    <Button variant="default" className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white">
                        <MessageSquare className="w-4 h-4" /> Reply
                    </Button>
                    <Button variant="default" className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                        Respond later
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
