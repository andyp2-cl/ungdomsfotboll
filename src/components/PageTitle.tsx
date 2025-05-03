
import React from 'react';

interface PageTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTitle({ children, className = '' }: PageTitleProps) {
  return (
    <h1 className={`text-2xl font-bold ${className}`}>
      {children}
    </h1>
  );
}
