"use client";

import { GuardTypeDataTable } from "@/components/guard-type/guard-type-data-table";
import GuardTypeTopCard from "@/components/guard-type/guard-type-top-card";
import { NoteDataTable } from "@/components/note/note-data-table";
import NoteTopCard from "@/components/note/note-top-card";




export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <GuardTypeTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <GuardTypeDataTable/>
        </div>
      </div>


    </div>
  );
}
