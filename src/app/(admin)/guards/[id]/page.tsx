"use client";

import ViewGuardTopCard from "@/components/guard/view-guard-top-card";
import { useParams } from "next/navigation";
import { guards } from "../data";
import { Guard } from "@/app/types/guard";
import { Card } from "@/components/ui/card";
import ViewGuardContent from "@/components/guard/view-guard-content";



export default function ViewGuardPage() {

    const params = useParams()
    const guardId = params.id

    const guard: Guard | undefined = guards.find(g => g.id.toString() === guardId);

    if (!guard) {
        return (
            <div className="flex flex-1 flex-col h-full">
                <div className="@container/main flex flex-1 flex-col gap-2 h-full">
                    <div className="pt-6 px-4 md:px-6">
                        <Card className="p-6 text-center">
                            <h2 className="text-xl font-semibold text-gray-900">Guard Not Found</h2>
                            <p className="text-gray-600 mt-2">The guard with ID {guardId} does not exist.</p>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col h-full">
            <div className="@container/main flex flex-1 flex-col gap-2 h-full">
                <div className="pt-6 px-4 md:px-6">
                    <ViewGuardTopCard guard={guard} />
                </div>
                <div className="py-2 px-4 md:px-6">
                    <ViewGuardContent guard={guard}/>
                </div>
            </div>


        </div>
    );
}
