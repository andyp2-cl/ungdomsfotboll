
import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export function PageContainer({ children, className = '', isLoading = false }: PageContainerProps) {
  return (
    <div className={`container mx-auto px-4 py-6 ${className}`}>
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : children}
    </div>
  );
}
