"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Client } from "@/app/types/client";
import { Card } from "@/components/ui/card";
import ViewClientContent from "@/components/clients/view-client-content";
import { useEffect, useState } from "react";
import ViewClientTopCard from "@/components/clients/view-client-top-card";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { fetchClient } from "@/store/slices/clientSlice";
import { Loader2 } from "lucide-react";

export default function ViewClientPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientId = Number(params.id);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const clientParam = searchParams.get("client");
      if (clientParam) {
        try {
          const decodedClient = JSON.parse(decodeURIComponent(clientParam));
          if (!cancelled) setClient(decodedClient);
        } catch {
          // fall through to API
        }
      }

      if (!clientId || Number.isNaN(clientId)) {
        if (!cancelled) {
          setIsLoading(false);
          setError("Invalid client id.");
        }
        return;
      }

      try {
        const result = await dispatch(
          fetchClient({
            id: clientId,
            params: { include: ["sites", "contacts", "documents"] },
          })
        ).unwrap();
        if (!cancelled) setClient(result);
      } catch (e: any) {
        if (!cancelled && !clientParam) {
          setError(e || "Client not found.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [clientId, searchParams, dispatch]);

  if (isLoading && !client) {
    return (
      <div className="flex flex-1 flex-col h-full">
        <div className="@container/main flex flex-1 flex-col gap-2 h-full">
          <div className="flex justify-center pt-16">
            <Loader2 className="h-6 w-6 animate-spin" />
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
              <h2 className="text-xl font-semibold text-gray-900">
                Client Not Found
              </h2>
              <p className="text-gray-600 mt-2">
                {error ||
                  `The client with ID ${clientId} does not exist or the data is not available.`}
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
          <ViewClientTopCard client={client} />
        </div>
        <div className="py-2 px-4 md:px-6">
          <ViewClientContent client={client} />
        </div>
      </div>
    </div>
  );
}
