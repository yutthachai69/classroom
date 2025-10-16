import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  color?: 'primary' | 'white' | 'gray';
  variant?: 'spinner' | 'dots' | 'pulse';
}

export default function LoadingSpinner({ 
  size = 'md', 
  text, 
  className = '',
  color = 'primary',
  variant = 'spinner'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    primary: 'text-green-500',
    white: 'text-white',
    gray: 'text-gray-500',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={cn(
              'w-2 h-2 rounded-full animate-bounce',
              colorClasses[color]
            )} style={{ animationDelay: '0ms' }}></div>
            <div className={cn(
              'w-2 h-2 rounded-full animate-bounce',
              colorClasses[color]
            )} style={{ animationDelay: '150ms' }}></div>
            <div className={cn(
              'w-2 h-2 rounded-full animate-bounce',
              colorClasses[color]
            )} style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={cn(
            'rounded-full animate-pulse',
            sizeClasses[size],
            colorClasses[color] === 'text-green-500' ? 'bg-green-500' : 
            colorClasses[color] === 'text-white' ? 'bg-white' : 'bg-gray-500'
          )}></div>
        );
      
      default:
        return (
          <div className={cn(
            'animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
            sizeClasses[size],
            colorClasses[color]
          )}>
            <span className="sr-only">Loading...</span>
          </div>
        );
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
      {renderSpinner()}
      {text && (
        <p className={cn(
          'text-sm animate-pulse',
          colorClasses[color]
        )}>{text}</p>
      )}
    </div>
  );
}

