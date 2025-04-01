
import React from "react";
import { LoadingState } from "@/components/LoadingState";
import { PlayerHeader } from "@/components/PlayerHeader";

interface PageContainerProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export function PageContainer({ isLoading, children }: PageContainerProps) {
  return (
    <div className="container py-6">
      <PlayerHeader />
      
      {isLoading ? (
        <LoadingState />
      ) : (
        children
      )}
    </div>
  );
}
