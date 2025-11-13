import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FloatingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  prefixIcon?: React.ReactNode
  postfixIcon?: React.ReactNode
  onPrefixClick?: () => void
  onPostfixClick?: () => void
  textareaSize?: 'sm' | 'md' | 'lg'
}

const FloatingLabelTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  (
    {
      label,
      className,
      id,
      prefixIcon,
      postfixIcon,
      onPrefixClick,
      onPostfixClick,
      textareaSize = 'md',
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const textareaId = id || generatedId

    // Unified size config with consistent small label
    const sizeConfig = {
      sm: {
        textarea: 'text-sm min-h-[2.5rem] pt-6 pb-2',
        label: 'text-xs',
        icon: 'text-sm',
        paddingLeft: prefixIcon ? 'pl-8' : '',
        paddingRight: postfixIcon ? 'pr-8' : '',
      },
      md: {
        textarea: 'text-base min-h-[3rem] pt-7 pb-2',
        label: 'text-xs',
        icon: 'text-base',
        paddingLeft: prefixIcon ? 'pl-10' : '',
        paddingRight: postfixIcon ? 'pr-10' : '',
      },
      lg: {
        textarea: 'text-lg min-h-[3.5rem] pt-8 pb-3',
        label: 'text-xs',
        icon: 'text-lg',
        paddingLeft: prefixIcon ? 'pl-12' : '',
        paddingRight: postfixIcon ? 'pr-12' : '',
      },
    }

    return (
      <div className="relative w-full">
        {/* Prefix Icon */}
        {prefixIcon && (
          <div
            className={cn(
              'absolute left-3 top-[1.9rem] transform -translate-y-1/2 z-10',
              sizeConfig[textareaSize].icon,
              onPrefixClick
                ? 'cursor-pointer hover:text-primary transition-colors'
                : 'pointer-events-none text-muted-foreground'
            )}
            onClick={onPrefixClick}
          >
            {prefixIcon}
          </div>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          placeholder=" "
          className={cn(
            'peer w-full resize-none border border-input bg-transparent rounded-md outline-none shadow-xs transition-all text-foreground',
            'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'px-3',
            sizeConfig[textareaSize].textarea,
            sizeConfig[textareaSize].paddingLeft,
            sizeConfig[textareaSize].paddingRight,
            className
          )}
          {...props}
        />

        {/* Postfix Icon */}
        {postfixIcon && (
          <div
            className={cn(
              'absolute right-3 top-[1.9rem] transform -translate-y-1/2 z-10',
              sizeConfig[textareaSize].icon,
              onPostfixClick
                ? 'cursor-pointer hover:text-primary transition-colors'
                : 'pointer-events-none text-muted-foreground'
            )}
            onClick={onPostfixClick}
          >
            {postfixIcon}
          </div>
        )}

        {/* Always Floating Small Label */}
        <label
          htmlFor={textareaId}
          className={cn(
            'absolute left-3 top-1 z-10 text-muted-foreground bg-background dark:bg-transparent px-1',
            'text-xs font-medium pointer-events-none transition-none',
            prefixIcon && 'left-8'
          )}
        >
          {label}
        </label>
      </div>
    )
  }
)

FloatingLabelTextarea.displayName = 'FloatingLabelTextarea'

export { FloatingLabelTextarea }
