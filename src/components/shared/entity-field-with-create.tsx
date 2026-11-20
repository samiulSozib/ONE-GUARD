'use client'

import { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  SearchableDropdownWithIcon,
} from '@/components/ui/searchable-dropdown-with-icon'
import type { SearchableDropdownProps } from '@/components/ui/searchable-dropdown'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type DropdownProps = Omit<SearchableDropdownProps, 'renderOption'> & {
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
}

interface EntityFieldWithCreateProps {
  label: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  dropdownProps: DropdownProps
  /** When false, + is hidden (e.g. missing permission). Default true. */
  canCreate?: boolean
  createDisabled?: boolean
  createTitle?: string
  onCreateClick?: () => void
  /** Extra content under the control (e.g. nested create dialogs stay at parent). */
  children?: ReactNode
}

/**
 * Searchable entity dropdown + optional inline "+" to create a related record
 * without leaving the current form. Matches expense/duty create UX.
 */
export function EntityFieldWithCreate({
  label,
  required,
  error,
  hint,
  className,
  dropdownProps,
  canCreate = true,
  createDisabled,
  createTitle = 'Create new',
  onCreateClick,
  children,
}: EntityFieldWithCreateProps) {
  const showCreate = canCreate && typeof onCreateClick === 'function'

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required ? ' *' : ''}
      </Label>
      <div className="flex gap-2">
        <div className="flex-1 min-w-0">
          <SearchableDropdownWithIcon {...dropdownProps} />
        </div>
        {showCreate && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 h-10 w-10"
            onClick={onCreateClick}
            disabled={createDisabled || dropdownProps.disabled}
            title={createTitle}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {children}
    </div>
  )
}
