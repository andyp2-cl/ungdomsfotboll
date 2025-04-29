
import { useState, useEffect, useCallback } from "react";

type ConnectionStats = {
  successCount: number;
  failCount: number;
  lastAttemptTime: number;
  averageConnectionTime: number;
  totalAttempts: number;
};

/**
 * Hook for managing and persisting database connection statistics
 */
export function useConnectionStats() {
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    successCount: 0,
    failCount: 0,
    lastAttemptTime: 0,
    averageConnectionTime: 0,
    totalAttempts: 0
  });
  
  // Load saved stats on init
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('db-connection-stats');
      if (savedStats) {
        setConnectionStats(JSON.parse(savedStats));
      }
    } catch (e) {
      console.error("Failed to load saved connection stats:", e);
    }
  }, []);
  
  // Stats management
  const updateConnectionStats = useCallback((success: boolean, timeTaken: number) => {
    setConnectionStats(prev => {
      const newStats = {
        successCount: prev.successCount + (success ? 1 : 0),
        failCount: prev.failCount + (success ? 0 : 1),
        lastAttemptTime: timeTaken,
        totalAttempts: prev.totalAttempts + 1,
        averageConnectionTime: (prev.averageConnectionTime * prev.totalAttempts + timeTaken) / (prev.totalAttempts + 1)
      };
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem('db-connection-stats', JSON.stringify(newStats));
      } catch (e) {
        console.error("Failed to save connection stats:", e);
      }
      
      return newStats;
    });
  }, []);
  
  return {
    connectionStats,
    updateConnectionStats
  };
}
