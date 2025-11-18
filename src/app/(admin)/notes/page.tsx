"use client";

import { NoteDataTable } from "@/components/note/note-data-table";
import NoteTopCard from "@/components/note/note-top-card";




export default function page() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="pt-6 px-4 md:px-6">
            <NoteTopCard/>
        </div>
        <div className="py-2 px-4 md:px-6">
            <NoteDataTable/>
        </div>
      </div>


    </div>
  );
}
