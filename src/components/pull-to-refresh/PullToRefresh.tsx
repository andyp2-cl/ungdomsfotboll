
import React, { useState, useEffect, useRef } from "react";
import { ArrowDown, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  pullDownThreshold = 80,
  maxPullDownDistance = 120
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Only enable pull-to-refresh on mobile
  const isEnabled = isMobile && !disabled;
  
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!isEnabled || isRefreshing) return;
      
      // Only enable pull-to-refresh when at the top of the page
      if (window.scrollY > 5) return;
      
      startY.current = e.touches[0].clientY;
      currentY.current = startY.current;
      setIsPulling(true);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || !isEnabled || isRefreshing) return;
      
      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, currentY.current - startY.current);
      
      // Apply resistance as user pulls further
      const dampedDistance = Math.min(
        maxPullDownDistance,
        distance * 0.4
      );
      
      setPullDistance(dampedDistance);
      
      // Prevent default scroll behavior when pulling
      if (dampedDistance > 10) {
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = async () => {
      if (!isPulling || !isEnabled || isRefreshing) return;
      
      if (pullDistance >= pullDownThreshold) {
        // Trigger refresh
        setIsRefreshing(true);
        setPullDistance(0);
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      } else {
        // Reset without refreshing
        setPullDistance(0);
      }
      
      setIsPulling(false);
    };
    
    if (isEnabled) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isEnabled, isRefreshing, onRefresh, pullDistance, pullDownThreshold]);
  
  return (
    <div ref={containerRef} className="relative w-full">
      {/* Pull to refresh indicator */}
      {isEnabled && (pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute left-0 right-0 flex justify-center items-center transition-transform z-10"
          style={{ 
            transform: `translateY(${pullDistance}px)`,
            top: "-40px" 
          }}
        >
          {isRefreshing ? (
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <div className="flex flex-col items-center">
              <ArrowDown 
                className="h-5 w-5 text-muted-foreground transition-transform" 
                style={{ 
                  transform: pullDistance >= pullDownThreshold 
                    ? 'rotate(180deg)' 
                    : 'rotate(0deg)'
                }} 
              />
              <span className="text-xs text-muted-foreground mt-1">
                {pullDistance >= pullDownThreshold 
                  ? "Släpp för att uppdatera" 
                  : "Dra för att uppdatera"}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Content container */}
      <div
        style={{
          transform: isEnabled ? `translateY(${pullDistance}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}
