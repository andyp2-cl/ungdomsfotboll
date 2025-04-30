
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { DatabaseStatus } from "../types";

/**
 * Hook for managing automatic reconnect effects and tasks
 */
export function useReconnectEffects(
  isOnline: boolean,
  error: string | undefined,
  dbStatus: DatabaseStatus,
  connectionAttempts: number,
  checkDbConnection: (force?: boolean) => Promise<void>
) {
  // Use a ref to track previous state
  const prevOnlineRef = useRef(isOnline);
  
  // Check connection when online status changes
  useEffect(() => {
    // Only check if we've gone from offline to online
    if (isOnline && !prevOnlineRef.current) {
      console.log("Network state changed from offline to online, checking database connection");
      toast.info("Nätverk tillgängligt igen, kontrollerar anslutning...");
      checkDbConnection(true);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline, checkDbConnection]);

  // Initial connection check on load and automatic retry
  useEffect(() => {
    checkDbConnection();
    
    // Set up automatic retry with increasing intervals if we're not connected
    const retryIntervals = [30000, 60000, 120000]; // 30s, 1min, 2min
    
    const retryChecks = () => {
      // Fix comparison to properly use string comparison with the exact type
      if (dbStatus !== 'connected' && isOnline && !error) {
        const interval = retryIntervals[Math.min(connectionAttempts, retryIntervals.length - 1)];
        console.log(`Scheduling automatic retry of database connection in ${interval/1000}s...`);
        
        return setTimeout(() => {
          // Fix comparison to properly use string comparison with the exact type
          if (dbStatus !== 'connected' && isOnline && !error) {
            console.log("Automatic retry of database connection...");
            checkDbConnection(true);
          }
        }, interval);
      }
      return undefined;
    };
    
    const intervalId = retryChecks();
    
    return () => {
      if (intervalId) clearTimeout(intervalId);
    }
  }, [isOnline, error, checkDbConnection, dbStatus, connectionAttempts]);
}
