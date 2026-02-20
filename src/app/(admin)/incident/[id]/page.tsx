"use client";

import { useParams } from "next/navigation";
import { Client } from "@/app/types/client";
import { Card } from "@/components/ui/card";
import ViewClientTopCard from "@/components/clients/view-client-top-card";
import ViewClientContent from "@/components/clients/view-client-content";
// import { incidents } from "../data";
import { Incident } from "@/app/types/incident";
import ViewIncidentTopCard from "@/components/incident/view-client-top-card";
import ViewIncidentContent from "@/components/incident/view-incident-content";



export default function ViewIncidentPage() {

    // const params = useParams()
    // const incidentId = params.id

    // const indicent: Incident | undefined = incidents.find(c => c.row.toString() === incidentId);

    // if (!indicent) {
    //     return (
    //         <div className="flex flex-1 flex-col h-full">
    //             <div className="@container/main flex flex-1 flex-col gap-2 h-full">
    //                 <div className="pt-6 px-4 md:px-6">
    //                     <Card className="p-6 text-center">
    //                         <h2 className="text-xl font-semibold text-gray-900">Client Not Found</h2>
    //                         <p className="text-gray-600 mt-2">The incidnet with ID {incidentId} does not exist.</p>
    //                     </Card>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    // return (
    //     <div className="flex flex-1 flex-col h-full">
    //         <div className="@container/main flex flex-1 flex-col gap-2 h-full">
    //             <div className="pt-6 px-4 md:px-6">
    //                 <ViewIncidentTopCard incident={indicent} />
    //             </div>
    //             <div className="py-2 px-4 md:px-6">
    //                 <ViewIncidentContent />
    //             </div>
    //         </div>


    //     </div>
    // );
}
