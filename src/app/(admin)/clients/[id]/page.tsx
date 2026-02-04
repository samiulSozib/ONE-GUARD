// app/clients/[id]/page.tsx
"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Client } from "@/app/types/client";
import { Card } from "@/components/ui/card";
import ViewClientContent from "@/components/clients/view-client-content";
import { useEffect, useState } from "react";
import ViewClientTopCard from "@/components/clients/view-client-top-card";

export default function ViewClientPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const clientId = params.id;

    useEffect(() => {
        // Try to get client from URL params first
        const clientParam = searchParams.get('client');
        
        if (clientParam) {
            try {
                const decodedClient = JSON.parse(decodeURIComponent(clientParam));
                setClient(decodedClient);
                setIsLoading(false);
            } catch (error) {
                console.error('Error parsing client from URL:', error);
                setIsLoading(false);
            }
        } else {
            // If no client in URL, try to find it in localStorage or sessionStorage
            // as a fallback (for direct navigation)
            const storedClient = localStorage.getItem(`client_${clientId}`);
            if (storedClient) {
                try {
                    setClient(JSON.parse(storedClient));
                } catch (error) {
                    console.error('Error parsing stored client:', error);
                }
            }
            setIsLoading(false);
        }
    }, [clientId, searchParams]);

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col h-full">
                <div className="@container/main flex flex-1 flex-col gap-2 h-full">
                    <div className="pt-6 px-4 md:px-6">
                        <Card className="p-6">
                            <div className="animate-pulse">
                                <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="flex flex-1 flex-col h-full">
                <div className="@container/main flex flex-1 flex-col gap-2 h-full">
                    <div className="pt-6 px-4 md:px-6">
                        <Card className="p-6 text-center">
                            <h2 className="text-xl font-semibold text-gray-900">Client Not Found</h2>
                            <p className="text-gray-600 mt-2">The client with ID {clientId} does not exist or the data is not available.</p>
                            <p className="text-sm text-gray-500 mt-4">
                                Please navigate to this page from the clients list to ensure all data is available.
                            </p>
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
                    {/* You can keep or remove ViewClientTopCard based on your needs */}
                    <ViewClientTopCard client={client} />
                </div>
                <div className="py-2 px-4 md:px-6">
                    <ViewClientContent client={client}/>
                </div>
            </div>
        </div>
    );
}