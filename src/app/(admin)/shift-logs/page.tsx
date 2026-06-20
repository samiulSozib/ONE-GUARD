'use client'

import { useState } from 'react'
import { ShiftLogsTopCard } from '@/components/shift-logs/shift-logs-top-card'
import { ShiftLogsDataTable } from '@/components/shift-logs/shift-logs-data-table'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { fetchShiftLogs, fetchGuardsStatus } from '@/store/slices/shiftLogsSlice'
import { ShiftLogParams } from '@/app/types/shiftLogs'

export default function ShiftLogsPage() {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [filters, setFilters] = useState<ShiftLogParams>({})

    const handleRefresh = () => {
        setIsLoading(true)
        dispatch(fetchGuardsStatus({}))
        dispatch(fetchShiftLogs({ page: 1, per_page: 20, ...filters }))
            .finally(() => setIsLoading(false))
    }

    const handleExport = () => {
        // Implement export functionality
        console.log('Exporting shift logs...')
    }

    const handleFilterChange = (newFilters: ShiftLogParams) => {
        setFilters(newFilters)
        dispatch(fetchShiftLogs({ page: 1, per_page: 20, ...newFilters }))
    }

    return (
        <div className="flex flex-1 flex-col h-full">
            <div className="@container/main flex flex-1 flex-col gap-2 h-full">
                <div className="pt-6 px-4 md:px-6">
                    <ShiftLogsTopCard
                        onRefresh={handleRefresh}
                        onExport={handleExport}
                        onFilterChange={handleFilterChange}
                        isLoading={isLoading}
                    />
                </div>
                <div className="py-2 px-4 md:px-6">
                    <ShiftLogsDataTable
                        filters={filters}
                        onViewDetails={(log) => {
                            // Navigate to log details or show modal
                            console.log('View log details:', log)
                        }}
                    />
                </div>
            </div>
        </div>
    )
}