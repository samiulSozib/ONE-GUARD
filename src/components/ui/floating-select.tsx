import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  prefixIcon?: React.ReactNode;
  postfixIcon?: React.ReactNode;
  onPrefixClick?: () => void;
  onPostfixClick?: () => void;
  inputSize?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const FloatingLabelSelect = React.forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ 
    className, 
    id, 
    label, 
    prefixIcon, 
    postfixIcon, 
    onPrefixClick, 
    onPostfixClick,
    inputSize = 'md',
    children,
    ...props 
  }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    // Size configurations
    const sizeConfig = {
      sm: {
        input: 'h-9 text-sm py-1',
        label: 'text-xs scale-75',
        icon: 'text-sm',
        padding: prefixIcon ? 'pl-8' : 'pl-3',
      },
      md: {
        input: 'h-11 text-base py-2',
        label: 'text-sm scale-75',
        icon: 'text-base',
        padding: prefixIcon ? 'pl-10' : 'pl-3',
      },
      lg: {
        input: 'h-14 text-lg py-3',
        label: 'text-base scale-75',
        icon: 'text-lg',
        padding: prefixIcon ? 'pl-12' : 'pl-4',
      }
    };

    return (
      <div className="relative">
        {/* Prefix Icon */}
        {prefixIcon && (
          <div 
            className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 z-10",
              sizeConfig[inputSize].icon,
              onPrefixClick ? "cursor-pointer hover:text-primary transition-colors" : "pointer-events-none text-muted-foreground"
            )}
            onClick={onPrefixClick}
          >
            {prefixIcon}
          </div>
        )}
        
        <select
          className={cn(
            'peer block w-full appearance-none rounded-md border border-input dark:bg-gray-900 px-3 py-2 text-sm ring-offset-background',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            sizeConfig[inputSize].input,
            sizeConfig[inputSize].padding,
            postfixIcon && 'pr-10',
            className
          )}
          ref={ref}
          id={inputId}
          {...props}
        >
          {children}
        </select>
        
        {/* Postfix Icon (typically a dropdown arrow) */}
        {postfixIcon && (
          <div 
            className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2 z-10",
              sizeConfig[inputSize].icon,
              onPostfixClick ? "cursor-pointer hover:text-primary transition-colors" : "pointer-events-none text-muted-foreground"
            )}
            onClick={onPostfixClick}
          >
            {postfixIcon}
          </div>
        )}
        
        {/* Default dropdown arrow if no postfix icon provided */}
        {!postfixIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground">
            <svg 
              className={cn("w-4 h-4", sizeConfig[inputSize].icon)} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
        
        <Label
          htmlFor={inputId}
          className={cn(
            'absolute start-2 top-2 z-10 origin-[0] -translate-y-4 transform duration-300',
            'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100',
            'peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75',
            'peer-focus:text-primary cursor-text',
            'bg-background dark:bg-transparent px-2',
            sizeConfig[inputSize].label,
            prefixIcon && 'left-8',
            'peer-placeholder-shown:text-muted-foreground',
            // For select, we need to check if a value is selected instead of placeholder
            'peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:-translate-y-4 peer-not-placeholder-shown:scale-75'
          )}
        >
          {label}
        </Label>
      </div>
    );
  },
);
FloatingLabelSelect.displayName = 'FloatingLabelSelect';

export { FloatingLabelSelect };