"use client"

import { Suspense } from "react"

import GuardCommandMapPage from "@/components/guard-live-map/guard-live-map-page"

export default function GuardLiveMapRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">
          Loading live map...
        </div>
      }
    >
      <GuardCommandMapPage />
    </Suspense>
  )
}
