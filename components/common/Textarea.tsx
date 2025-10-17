import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  animated?: boolean;
  icon?: React.ReactNode;
}

export default function Textarea({ 
  label, 
  error, 
  success,
  className, 
  animated = true,
  icon,
  ...props 
}: TextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      setHasValue(!!textareaRef.current.value);
    }
  }, [props.value]);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    if (props.onBlur) props.onBlur(e);
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (success) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return null;
  };

  return (
    <div className="w-full">
      {label && !animated && (
        <label className={cn(
          'block text-sm font-medium mb-2 transition-colors duration-200',
          error ? 'text-red-700' : success ? 'text-green-700' : 'text-gray-700'
        )}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 text-gray-400">
            {icon}
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          className={cn(
            'w-full px-4 py-3 border rounded-lg transition-all duration-300 focus:ring-2 focus:border-transparent outline-none resize-none',
            icon ? 'pl-10' : '',
            error && 'border-red-500 focus:ring-red-500 bg-red-50',
            success && 'border-green-500 focus:ring-green-500 bg-green-50',
            !error && !success && 'border-gray-300 focus:ring-blue-500 hover:border-gray-400',
            animated && 'transform hover:scale-[1.01] focus:scale-[1.01]',
            animated && label && 'pt-6',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {/* Floating Label Animation - Only show when focused or has value */}
        {animated && label && (isFocused || hasValue) && (
          <label
            className={cn(
              'absolute left-3 top-1 text-xs text-blue-600 bg-white px-1 transition-all duration-200 pointer-events-none z-10'
            )}
          >
            {label}
          </label>
        )}
        
        {/* Status Icon */}
        {getStatusIcon() && (
          <div className="absolute right-3 top-3">
            {getStatusIcon()}
          </div>
        )}
        
        {/* Focus Ring Animation */}
        {animated && isFocused && (
          <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-opacity-50 pointer-events-none animate-pulse"></div>
        )}
      </div>
      
      {/* Error/Success Message */}
      {(error || success) && (
        <div className={cn(
          'mt-2 text-sm transition-all duration-200',
          error ? 'text-red-600' : 'text-green-600'
        )}>
          {error || success}
        </div>
      )}
    </div>
  );
}
