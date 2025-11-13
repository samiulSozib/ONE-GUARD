"use client";

import { useParams } from "next/navigation";
import { Client } from "@/app/types/client";
import { Card } from "@/components/ui/card";
import { clients } from "../data";
import ViewClientTopCard from "@/components/clients/view-client-top-card";
import ViewClientContent from "@/components/clients/view-client-content";



export default function ViewClientPage() {

    const params = useParams()
    const clientId = params.id

    const client: Client | undefined = clients.find(c => c.id.toString() === clientId);

    if (!client) {
        return (
            <div className="flex flex-1 flex-col h-full">
                <div className="@container/main flex flex-1 flex-col gap-2 h-full">
                    <div className="pt-6 px-4 md:px-6">
                        <Card className="p-6 text-center">
                            <h2 className="text-xl font-semibold text-gray-900">Client Not Found</h2>
                            <p className="text-gray-600 mt-2">The client with ID {clientId} does not exist.</p>
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
                    <ViewClientTopCard client={client} />
                </div>
                <div className="py-2 px-4 md:px-6">
                    <ViewClientContent client={client}/>
                </div>
            </div>


        </div>
    );
}
