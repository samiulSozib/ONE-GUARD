import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefixIcon?: React.ReactNode;
  postfixIcon?: React.ReactNode;
  onPrefixClick?: () => void;
  onPostfixClick?: () => void;
  inputSize?: 'sm' | 'md' | 'lg'; // Renamed from 'size' to 'inputSize'
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ 
    className, 
    id, 
    label, 
    prefixIcon, 
    postfixIcon, 
    onPrefixClick, 
    onPostfixClick,
    inputSize = 'md', // Updated prop name
    ...props 
  }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    // Size configurations
    const sizeConfig = {
      sm: {
        input: 'h-9 text-sm',
        label: 'text-xs scale-75',
        icon: 'text-sm',
        padding: prefixIcon ? 'pl-8' : '',
      },
      md: {
        input: 'h-11 text-base',
        label: 'text-sm scale-75',
        icon: 'text-base',
        padding: prefixIcon ? 'pl-10' : '',
      },
      lg: {
        input: 'h-14 text-lg',
        label: 'text-base scale-75',
        icon: 'text-lg',
        padding: prefixIcon ? 'pl-12' : '',
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
        
        <Input 
          placeholder=" " 
          className={cn(
            'peer block w-full appearance-none',
            sizeConfig[inputSize].input,
            prefixIcon && sizeConfig[inputSize].padding,
            postfixIcon && 'pr-10',
            className
          )} 
          ref={ref} 
          id={inputId} 
          {...props} 
        />
        
        {/* Postfix Icon */}
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
          )}
        >
          {label}
        </Label>
      </div>
    );
  },
);
FloatingLabelInput.displayName = 'FloatingLabelInput';

export { FloatingLabelInput };