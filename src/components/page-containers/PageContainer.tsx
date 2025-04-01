
import React, { ReactNode } from "react";
import LoadingState from "../LoadingState";
import { EditModeButton } from "../EditModeButton";

interface PageContainerProps {
  children: ReactNode;
  isLoading?: boolean;
}

export function PageContainer({ children, isLoading = false }: PageContainerProps) {
  return (
    <div className="container mx-auto px-4 pb-20 pt-6 min-h-screen">
      <EditModeButton />
      {isLoading ? <LoadingState /> : children}
    </div>
  );
}
