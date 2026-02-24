'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface SearchableDropdownOption {
  value: string | number
  label: string
  [key: string]: unknown
}

/** 🔴 THIS MUST BE EXPORTED */
export interface SearchableDropdownProps {
  value?: string | number
  onValueChange: (value: string | number) => void
  options: SearchableDropdownOption[]
  onSearch?: (searchTerm: string) => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  emptyMessage?: string
  searchPlaceholder?: string
  className?: string
  renderOption?: (option: SearchableDropdownOption) => ReactNode
  displayValue?: (
    value: string | number | undefined,
    options: SearchableDropdownOption[]
  ) => string
}

export function SearchableDropdown({
  value,
  onValueChange,
  options,
  onSearch,
  placeholder = "Select an option",
  disabled = false,
  isLoading = false,
  emptyMessage = "No options found",
  searchPlaceholder = "Search...",
  className,
  renderOption,
  displayValue,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // debounced search
useEffect(() => {
  if (!onSearch) return

  // 🚫 empty / whitespace search ignore
  if (!searchTerm.trim()) return

  const timer = setTimeout(() => {
    onSearch(searchTerm)
  }, 300)

  return () => clearTimeout(timer)
}, [searchTerm])

  const handleSelect = (option: SearchableDropdownOption) => {
    onValueChange(option.value)
    setIsOpen(false)
    setSearchTerm("")
  }

  const displayText = displayValue
    ? displayValue(value, options)
    : selectedOption?.label ?? placeholder

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        disabled={disabled}
        className={cn(
          "w-full justify-between h-11 px-3",
          !value && "text-muted-foreground"
        )}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 opacity-50 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-md border bg-white dark:bg-gray-900 shadow-lg">
          {/* search */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                autoFocus
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8 h-9"
              />
            </div>
          </div>

          {/* list */}
          <ScrollArea className="max-h-60">
            {isLoading ? (
              <div className="py-4 text-center text-sm">Loading...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
                    value === option.value && "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <>
                      <span className="flex-1 truncate text-left">
                        {option.label}
                      </span>
                      {value === option.value && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </>
                  )}
                </button>
              ))
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
