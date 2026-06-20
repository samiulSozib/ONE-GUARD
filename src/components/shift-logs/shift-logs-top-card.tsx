'use client'

import React, { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { 
    PlusIcon, 
    RefreshCw, 
    Download, 
    CalendarIcon,
    Filter
} from 'lucide-react'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { fetchGuardsStatus, fetchShiftLogs } from '@/store/slices/shiftLogsSlice'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar } from '../ui/calender'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'

interface ShiftLogsTopCardProps {
    onRefresh?: () => void
    onExport?: () => void
    onFilterChange?: (filters: any) => void
    isLoading?: boolean
}

export function ShiftLogsTopCard({ 
    onRefresh, 
    onExport, 
    onFilterChange,
    isLoading 
}: ShiftLogsTopCardProps) {
    const dispatch = useAppDispatch()
    const [startDate, setStartDate] = useState<Date | undefined>()
    const [endDate, setEndDate] = useState<Date | undefined>()
    const [actionFilter, setActionFilter] = useState<string>("all")

    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh()
        } else {
            dispatch(fetchGuardsStatus({}))
            dispatch(fetchShiftLogs({ page: 1, per_page: 20 }))
        }
    }

    const handleExport = () => {
        if (onExport) {
            onExport()
        }
    }

    const applyFilters = () => {
        if (onFilterChange) {
            onFilterChange({
                start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
                action: actionFilter !== "all" ? actionFilter : undefined,
            })
        }
    }

    return (
        <Card className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-2 lg:p-4'>
            <span className='text-lg font-bold dark:text-white'>Shift Logs</span>
            
            <div className='flex flex-row flex-wrap gap-2 w-full md:w-auto'>
                {/* Date Filters */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9"
                        >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {startDate ? format(startDate, 'MMM dd') : 'Start'}
                            {endDate && ` - ${format(endDate, 'MMM dd')}`}
                            {!startDate && !endDate && 'Filter Dates'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 space-y-4" align="end">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                initialFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                initialFocus
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                onClick={applyFilters}
                                className="flex-1"
                            >
                                Apply
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                    setStartDate(undefined)
                                    setEndDate(undefined)
                                    setActionFilter("all")
                                    if (onFilterChange) {
                                        onFilterChange({})
                                    }
                                }}
                            >
                                Clear
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Action Filter */}
                <Select value={actionFilter} onValueChange={(value) => {
                    setActionFilter(value)
                    if (onFilterChange) {
                        onFilterChange({
                            start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                            end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
                            action: value !== "all" ? value : undefined,
                        })
                    }
                }}>
                    <SelectTrigger className="w-[130px] h-9">
                        <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="check_in">Check In</SelectItem>
                        <SelectItem value="check_out">Check Out</SelectItem>
                        <SelectItem value="break">Break</SelectItem>
                        <SelectItem value="patrol">Patrol</SelectItem>
                        <SelectItem value="incident">Incident</SelectItem>
                    </SelectContent>
                </Select>

                {/* Refresh Button */}
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="h-9"
                >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>

                {/* Export Button */}
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExport}
                    className="h-9"
                >
                    <Download className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    )
}