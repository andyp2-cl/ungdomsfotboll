import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
  text?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const variantClasses = {
  default: 'text-muted-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary-foreground'
};

export const LoadingSpinner = React.memo<LoadingSpinnerProps>(({
  size = 'md',
  variant = 'default',
  className,
  text,
  showText = false
}) => {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          sizeClasses[size],
          variantClasses[variant]
        )}
        role="status"
        aria-label="Laddar..."
      />
      {showText && (
        <span className={cn('text-sm', variantClasses[variant])}>
          {text || 'Laddar...'}
        </span>
      )}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

// Skeleton loading component
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton = React.memo<SkeletonProps>(({
  className,
  width,
  height
}) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      style={{
        width: width,
        height: height
      }}
    />
  );
});

Skeleton.displayName = 'Skeleton';

// Loading overlay component
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  className?: string;
}

export const LoadingOverlay = React.memo<LoadingOverlayProps>(({
  isLoading,
  children,
  text = 'Laddar...',
  className
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <LoadingSpinner size="lg" text={text} showText />
      </div>
    </div>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';

// Page loading component
export const PageLoader = React.memo(() => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="xl" variant="primary" />
      <p className="text-muted-foreground">Laddar sida...</p>
    </div>
  </div>
));

PageLoader.displayName = 'PageLoader'; 