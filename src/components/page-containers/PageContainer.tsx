
import React from "react";
import { LoadingState } from "@/components/LoadingState";
import { PlayerHeader } from "@/components/PlayerHeader";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageContainerProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
}

export function PageContainer({ 
  isLoading, 
  children, 
  className = "",
  showHeader = true 
}: PageContainerProps) {
  const { isMobile, isTouchDevice } = useIsMobile();
  
  return (
    <div className={cn(
      "min-h-screen bg-background",
      isMobile ? "pb-20" : "pb-6", // Extra padding for mobile nav
      className
    )}>
      <div className={cn(
        "container mx-auto",
        isMobile 
          ? "px-4 py-4 max-w-full" 
          : "px-6 py-6 max-w-7xl",
        isTouchDevice && "touch-manipulation"
      )}>
        {showHeader && (
          <div className={cn(
            "mb-6",
            isMobile && "mb-4"
          )}>
            <PlayerHeader />
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingState />
          </div>
        ) : (
          <main className={cn(
            "w-full",
            isMobile && "space-y-4"
          )}>
            {children}
          </main>
        )}
      </div>
    </div>
  );
}

// Helper function for className concatenation
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
