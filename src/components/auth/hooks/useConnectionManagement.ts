
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  testDatabaseAccess, 
  getConnectionError, 
  forceReconnect
} from "../utils/databaseUtils";
import { forceResetConnection } from "@/lib/supabase/client";

export function useConnectionManagement(isOnline: boolean) {
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRLSEnabled, setIsRLSEnabled] = useState(false);
  
  // Check for connection error from local storage on mount
  useEffect(() => {
    const storedError = getConnectionError();
    if (storedError) {
      setConnectionError(storedError);
    }
  }, []);
  
  // Check database connection with memoized callback to prevent recreating on each render
  const checkDatabaseConnection = useCallback(async () => {
    if (!isOnline) {
      setConnectionChecked(true);
      setIsConnecting(false);
      return;
    }
    
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      console.log("Checking database connection at", new Date().toISOString());
      
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Test database access
      const { success, error } = await testDatabaseAccess();
      
      if (success) {
        setIsRLSEnabled(true);
        setConnectionError(null);
      } else {
        setIsRLSEnabled(false);
        setConnectionError(error || "Kunde inte ansluta till databasen");
        console.error("Database connection error:", error);
      }
    } catch (error) {
      console.error("Error checking database connection:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown connection error";
      setConnectionError(errorMessage);
      setIsRLSEnabled(false);
    } finally {
      setConnectionChecked(true);
      setIsConnecting(false);
    }
  }, [isOnline]);
  
  // Force a fresh connection with cleared cache
  const handleForceReconnect = useCallback(async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // First try our regular reconnect
      await forceReconnect();
      
      // If that doesn't work, try an even more aggressive reset
      if (connectionError) {
        await forceResetConnection();
      }
      
      // Check connection again
      await checkDatabaseConnection();
    } catch (error) {
      console.error("Error during forced reconnection:", error);
      setConnectionError(error instanceof Error ? error.message : "Unknown reconnection error");
    } finally {
      setIsConnecting(false);
    }
  }, [connectionError, checkDatabaseConnection]);
  
  // Check for existing session with improved persistence
  useEffect(() => {
    // Initial connection check
    checkDatabaseConnection();
    
    // Set up periodic connection check (every 5 minutes)
    const intervalId = setInterval(() => {
      console.log("Performing periodic connection check");
      checkDatabaseConnection();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isOnline, checkDatabaseConnection]);
  
  return {
    connectionChecked,
    isConnecting,
    connectionError,
    isRLSEnabled,
    checkDatabaseConnection,
    handleForceReconnect
  };
}
