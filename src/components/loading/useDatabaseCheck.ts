
import { useState, useEffect, useCallback } from "react";
import { testDatabaseAccess } from "@/components/auth/utils/databaseUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDatabaseCheck(isOnline: boolean, error?: string) {
  const [dbStatus, setDbStatus] = useState<'unknown' | 'connecting' | 'connected' | 'error'>('unknown');
  const [dbError, setDbError] = useState<string | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

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
      
      while (attempts < 3 && !success) {
        try {
          const result = await testDatabaseAccess();
          if (result.success) {
            console.log(`Database connection successful on attempt ${attempts + 1}`);
            setDbStatus('connected');
            setDbError(null);
            success = true;
            break;
          } else {
            console.log(`Database connection failed on attempt ${attempts + 1}:`, result.error);
            lastError = result.error;
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
      
      if (!success) {
        setDbStatus('error');
        setDbError(lastError || "Kunde inte ansluta till databasen efter flera försök");
        console.error("All database connection attempts failed");
      }
    } catch (err) {
      console.error("Unexpected error during database connection check:", err);
      setDbStatus('error');
      setDbError(err instanceof Error ? err.message : "Okänt fel");
    } finally {
      setIsCheckingDb(false);
    }
  }, [isOnline, error, dbStatus]);

  // Initial connection check on load
  useEffect(() => {
    checkDbConnection();
    
    // Set up automatic retry every 30 seconds if we're not connected
    const intervalId = setInterval(() => {
      if (dbStatus !== 'connected' && isOnline && !error) {
        console.log("Automatic retry of database connection...");
        checkDbConnection(true);
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [isOnline, error, checkDbConnection, dbStatus]);

  return {
    dbStatus,
    dbError,
    isCheckingDb,
    setIsCheckingDb,
    setDbStatus,
    connectionAttempts,
    checkDbConnection // Export the check function to allow manual retries
  };
}
