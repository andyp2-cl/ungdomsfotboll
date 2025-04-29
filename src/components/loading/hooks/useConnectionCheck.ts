
import { useState, useCallback } from "react";
import { testDatabaseAccess } from "@/components/auth/utils/databaseUtils";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { DatabaseStatus } from "../types";

/**
 * Hook for handling database connection checking logic
 */
export function useConnectionCheck(
  isOnline: boolean, 
  error: string | undefined,
  dbStatus: DatabaseStatus,
  setDbStatus: (status: DatabaseStatus) => void,
  setDbError: (error: string | null) => void,
  updateConnectionStats: (success: boolean, timeTaken: number) => void,
  connectionAttempts: number,
  setConnectionAttempts: (count: number) => void
) {
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  
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
  }, [isOnline, error, dbStatus, setDbStatus, setDbError, connectionAttempts, updateConnectionStats, setConnectionAttempts]);
  
  return {
    isCheckingDb,
    setIsCheckingDb,
    checkDbConnection
  };
}
