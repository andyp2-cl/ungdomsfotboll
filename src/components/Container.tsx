
import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <div className="container mx-auto py-4 px-4">
      {children}
    </div>
  );
}
