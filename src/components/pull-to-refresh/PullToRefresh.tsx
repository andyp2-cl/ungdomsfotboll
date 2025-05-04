
import React, { useEffect, useState, useRef } from "react";
import { ArrowDown, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isMobile = useIsMobile();
  
  // Don't enable pull-to-refresh on desktop
  if (!isMobile) {
    return <>{children}</>;
  }

  const THRESHOLD = 80; // Pull distance required to trigger refresh
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    
    // Only enable pull-to-refresh when at the top of the page
    if (scrollTop <= 0) {
      setIsPulling(true);
      touchStartY.current = e.touches[0].clientY;
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY.current;
    
    // Only register downward pulls
    if (distance > 0) {
      // Calculate a diminishing return for longer pulls
      const pullAmount = Math.min(distance * 0.5, THRESHOLD * 1.5);
      setPullDistance(pullAmount);
      
      // Prevent native scrolling when pulling
      if (pullAmount > 5) {
        e.preventDefault();
      }
    }
  };
  
  const handleTouchEnd = async () => {
    if (!isPulling || disabled) return;
    
    if (pullDistance >= THRESHOLD) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error("Refresh failed:", error);
      }
      
      // Delay reset slightly to show the refresh animation
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
      }, 1000);
    } else {
      // Just reset if we didn't pull far enough
      setPullDistance(0);
      setIsPulling(false);
    }
  };
  
  return (
    <div 
      className="relative w-full min-h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="absolute left-0 right-0 flex justify-center items-center transition-all duration-200"
        style={{ 
          height: '60px', 
          top: isPulling ? `${pullDistance}px` : '-60px',
          transform: isRefreshing ? 'scale(1)' : `scale(${Math.min(pullDistance / THRESHOLD, 1)})`,
          opacity: isPulling || isRefreshing ? 1 : 0
        }}
      >
        {isRefreshing ? (
          <div className="flex flex-col items-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs mt-1 text-muted-foreground">Uppdaterar...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <ArrowDown className="h-6 w-6 text-primary" />
            <span className="text-xs mt-1 text-muted-foreground">
              Dra för att uppdatera
            </span>
          </div>
        )}
      </div>
      
      <div style={{ 
        transform: isPulling ? `translateY(${pullDistance}px)` : 'none',
        transition: isPulling ? 'none' : 'transform 0.2s ease-out'
      }}>
        {children}
      </div>
    </div>
  );
}
