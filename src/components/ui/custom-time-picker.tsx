'use client'
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface CustomTimePickerProps {
    value: string
    onChange: (time: string) => void
    label?: string
    placeholder?: string
    error?: string
    disabled?: boolean
    required?: boolean
    className?: string
    minuteInterval?: 15 | 30 | 60
    includeSeconds?: boolean
    format12h?: boolean
}

export function CustomTimePicker({
    value,
    onChange,
    label,
    placeholder = "Select time",
    error,
    disabled = false,
    required = false,
    className = "",
    minuteInterval = 30,
    includeSeconds = false,
    format12h = true
}: CustomTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Handle input change
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value)
    }

    // Format time for display
    const formatTimeDisplay = (time: string) => {
        if (!time) return placeholder

        if (includeSeconds) {
            const [hours, minutes, seconds] = time.split(':')
            const h = parseInt(hours)
            if (format12h) {
                const ampm = h >= 12 ? 'PM' : 'AM'
                const h12 = h % 12 || 12
                return seconds ? `${h12}:${minutes}:${seconds} ${ampm}` : `${h12}:${minutes} ${ampm}`
            }
            return time
        } else {
            const [hours, minutes] = time.split(':')
            const h = parseInt(hours)
            if (format12h) {
                const ampm = h >= 12 ? 'PM' : 'AM'
                const h12 = h % 12 || 12
                return `${h12}:${minutes} ${ampm}`
            }
            return `${hours}:${minutes}`
        }
    }

    // Generate all times
    const generateAllTimes = () => {
        const times = []
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += minuteInterval) {
                const hourStr = hour.toString().padStart(2, '0')
                const minuteStr = minute.toString().padStart(2, '0')

                if (includeSeconds) {
                    for (let second = 0; second < 60; second += 30) {
                        const secondStr = second.toString().padStart(2, '0')
                        times.push(`${hourStr}:${minuteStr}:${secondStr}`)
                    }
                } else {
                    times.push(`${hourStr}:${minuteStr}`)
                }
            }
        }
        return times
    }

    const allTimes = generateAllTimes()

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative" ref={dropdownRef}>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="time"
                            value={value}
                            onChange={handleTimeChange}
                            disabled={disabled}
                            placeholder={placeholder}
                            className={cn(
                                "w-full px-3 py-2 text-sm border rounded-md outline-none bg-white dark:bg-gray-800",
                                error ? "border-red-500" : "border-gray-300 dark:border-gray-600",
                                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                disabled && "opacity-50 cursor-not-allowed",
                                "transition-all duration-200"
                            )}
                            style={{
                                height: '44px',
                                fontSize: '14px'
                            }}
                            step={minuteInterval * 60}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        disabled={disabled}
                        className={cn(
                            "px-3 border rounded-md flex items-center gap-1",
                            "bg-white dark:bg-gray-800",
                            "border-gray-300 dark:border-gray-600",
                            "hover:bg-gray-50 dark:hover:bg-gray-700",
                            "transition-colors duration-200",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        style={{ height: '44px' }}
                    >
                        <ChevronDown className={cn(
                            "h-4 w-4 transition-transform",
                            isOpen && "rotate-180"
                        )} />
                    </button>
                </div>

                {/* Dropdown */}
                {isOpen && !disabled && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-h-[300px] overflow-y-auto">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center sticky top-0 bg-white dark:bg-gray-800 py-1 z-10">
                            Quick Select
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                            {allTimes.map((t) => {
                                const displayTime = formatTimeDisplay(t)
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => {
                                            onChange(t)
                                            setIsOpen(false)
                                        }}
                                        className={cn(
                                            "px-2 py-1.5 text-xs rounded transition-all",
                                            value === t
                                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                                        )}
                                    >
                                        {displayTime}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    )
}
