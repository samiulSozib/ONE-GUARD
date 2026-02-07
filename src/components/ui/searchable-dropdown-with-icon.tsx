'use client'

import { LucideIcon } from 'lucide-react'
import {
  SearchableDropdown,
  SearchableDropdownOption,
  SearchableDropdownProps,
} from "./searchable-dropdown"

interface SearchableDropdownWithIconProps
  extends Omit<SearchableDropdownProps, "renderOption"> {
  icon?: LucideIcon
  iconPosition?: "left" | "right"
}

export function SearchableDropdownWithIcon({
  icon: Icon,
  iconPosition = "left",
  ...props
}: SearchableDropdownWithIconProps) {
  const renderOptionWithIcon = (option: SearchableDropdownOption) => (
    <div className="flex items-center">
      {Icon && iconPosition === "left" && (
        <Icon className="mr-2 h-4 w-4 shrink-0" />
      )}

      <span className="flex-1 truncate">{option.label}</span>

      {Icon && iconPosition === "right" && (
        <Icon className="ml-2 h-4 w-4 shrink-0" />
      )}
    </div>
  )

  return (
    <SearchableDropdown
      {...props}
      renderOption={renderOptionWithIcon}
    />
  )
}
