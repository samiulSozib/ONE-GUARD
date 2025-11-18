"use client";

import { ContactDataTable } from "@/components/contact/contact-data-table";
import ContactTopCard from "@/components/contact/contact-top-card";




export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <ContactTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <ContactDataTable/>
        </div>
      </div>


    </div>
  );
}
