
import { useState, useEffect, useCallback, useRef } from "react";
import { testDatabaseAccess } from "@/components/auth/utils/databaseUtils";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

type ConnectionStats = {
  successCount: number;
  failCount: number;
  lastAttemptTime: number;
  averageConnectionTime: number;
  totalAttempts: number;
};

export function useDatabaseCheck(isOnline: boolean, error?: string) {
  const [dbStatus, setDbStatus] = useState<'unknown' | 'connecting' | 'connected' | 'error'>('unknown');
  const [dbError, setDbError] = useState<string | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    successCount: 0,
    failCount: 0,
    lastAttemptTime: 0,
    averageConnectionTime: 0,
    totalAttempts: 0
  });
  
  // Use a ref to track previous state
  const prevOnlineRef = useRef(isOnline);
  
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

  // Memoized function for checking database connection
  const checkDbConnection = useCallback(async (force = false) => {
    if (!isOnline) {
      console.log("Skip database check - device is offline");
      return;
    }
    
    if (error) {
      console.log("Skip database check due to existing error:", error);
      return;
    }
    
    // If already connected and not forcing, skip check
    if (dbStatus === 'connected' && !force) {
      return;
    }
    
    try {
      console.log("Checking database connection...");
      setDbStatus('connecting');
      setIsCheckingDb(true);
      const startTime = performance.now();
      
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session check:", session ? "Active session found" : "No active session");
      
      // Try to refresh the session if we have one
      if (session) {
        try {
          console.log("Refreshing session before database check");
          await supabase.auth.refreshSession();
        } catch (err) {
          console.log("Session refresh failed:", err);
        }
      }
      
      // Test database access with retry logic
      let attempts = 0;
      let success = false;
      let lastError;
      let queryTimes: number[] = [];
      
      while (attempts < 3 && !success) {
        try {
          const queryStartTime = performance.now();
          const result = await testDatabaseAccess();
          const queryTime = performance.now() - queryStartTime;
          queryTimes.push(queryTime);
          
          if (result.success) {
            console.log(`Database connection successful on attempt ${attempts + 1} in ${queryTime.toFixed(2)}ms`);
            setDbStatus('connected');
            setDbError(null);
            success = true;
            
            // Store performance data
            localStorage.setItem('db-last-query-time', queryTime.toString());
            break;
          } else {
            console.log(`Database connection failed on attempt ${attempts + 1}:`, result.error);
            lastError = result.error;
            
            // Store more detailed error info
            if (result.details) {
              localStorage.setItem('db-error-details', JSON.stringify(result.details));
            }
          }
        } catch (err) {
          console.error(`Database connection error on attempt ${attempts + 1}:`, err);
          lastError = err instanceof Error ? err.message : "Okänt fel";
        }
        
        attempts++;
        setConnectionAttempts(prev => prev + 1);
        
        if (attempts < 3) {
          console.log(`Waiting before retry attempt ${attempts + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Track total time
      const totalTime = performance.now() - startTime;
      
      // Update stats
      updateConnectionStats(success, totalTime);
      
      if (!success) {
        setDbStatus('error');
        setDbError(lastError || "Kunde inte ansluta till databasen efter flera försök");
        console.error("All database connection attempts failed");
        
        // Store failure data
        localStorage.setItem('db-connection-failed', 'true');
        localStorage.setItem('db-connection-failed-time', Date.now().toString());
        localStorage.setItem('db-connection-failed-reason', lastError || 'Unknown');
        localStorage.setItem('db-connection-attempts', attempts.toString());
        
        // If we've tried many times, show a helpful message
        if (connectionAttempts > 5) {
          toast.error("Problem med databasanslutningen. Försök att ladda om sidan eller logga in igen.", {
            duration: 10000,
            action: {
              label: "Ladda om",
              onClick: () => window.location.reload()
            }
          });
        }
      } else {
        // Clear failure data on success
        localStorage.removeItem('db-connection-failed');
        localStorage.removeItem('db-connection-failed-time');
        localStorage.removeItem('db-connection-failed-reason');
        
        // Store success data
        localStorage.setItem('db-connection-success', 'true');
        localStorage.setItem('db-connection-success-time', Date.now().toString());
        localStorage.setItem('db-connection-attempts', attempts.toString());
        localStorage.setItem('db-query-times', JSON.stringify(queryTimes));
      }
    } catch (err) {
      console.error("Unexpected error during database connection check:", err);
      setDbStatus('error');
      setDbError(err instanceof Error ? err.message : "Okänt fel");
      
      // Save detailed error info
      const errorDetails = {
        message: err instanceof Error ? err.message : "Okänt fel",
        name: err instanceof Error ? err.name : "Unknown",
        stack: err instanceof Error ? err.stack : undefined,
        time: Date.now()
      };
      localStorage.setItem('db-unexpected-error', JSON.stringify(errorDetails));
    } finally {
      setIsCheckingDb(false);
    }
  }, [isOnline, error, dbStatus, connectionAttempts, updateConnectionStats]);

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

  // Initial connection check on load
  useEffect(() => {
    checkDbConnection();
    
    // Set up automatic retry with increasing intervals if we're not connected
    const retryIntervals = [30000, 60000, 120000]; // 30s, 1min, 2min
    
    const retryChecks = () => {
      if (dbStatus !== 'connected' && isOnline && !error) {
        const interval = retryIntervals[Math.min(connectionAttempts, retryIntervals.length - 1)];
        console.log(`Scheduling automatic retry of database connection in ${interval/1000}s...`);
        
        return setTimeout(() => {
          if (dbStatus !== 'connected' && isOnline && !error) {
            console.log("Automatic retry of database connection...");
            checkDbConnection(true);
          }
        }, interval);
      }
    };
    
    const intervalId = retryChecks();
    
    return () => {
      if (intervalId) clearTimeout(intervalId);
    }
  }, [isOnline, error, checkDbConnection, dbStatus, connectionAttempts]);

  return {
    dbStatus,
    dbError,
    isCheckingDb,
    setIsCheckingDb,
    setDbStatus,
    connectionAttempts,
    connectionStats,
    checkDbConnection // Export the check function to allow manual retries
  };
}
