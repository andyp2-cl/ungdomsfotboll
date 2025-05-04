
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { testDatabaseAccess, connectAnonymously } from '../utils/databaseUtils';
import { toast } from 'sonner';

export function useConnectionManagement(isOnline: boolean) {
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRLSEnabled, setIsRLSEnabled] = useState(false);

  // Check database connection with automatic connect
  const checkDatabaseConnection = useCallback(async (forceCheck = false) => {
    if (!isOnline) {
      console.log("Skip connection check - device is offline");
      setConnectionChecked(true);
      return;
    }

    try {
      setIsConnecting(true);
      
      // First check cached connection status to avoid unnecessary checks
      const cachedStatus = localStorage.getItem('sb-connection-test');
      const cachedTime = localStorage.getItem('sb-connection-test-time');
      const cacheIsValid = cachedStatus === 'true' && cachedTime && 
                         (Date.now() - parseInt(cachedTime, 10)) < 1000 * 60 * 5; // 5 minutes
      
      if (cacheIsValid && !forceCheck) {
        console.log("Using cached connection status");
        setConnectionChecked(true);
        setIsConnecting(false);
        setConnectionError(null);
        return;
      }
      
      console.log("Testing database connection...");
      
      // Always try to connect directly
      const { success, rlsEnabled } = await testDatabaseAccess();
        
      if (success) {
        console.log("Database connection established successfully");
        setConnectionChecked(true);
        setConnectionError(null);
        setIsRLSEnabled(rlsEnabled || false);
      } else {
        console.log("Database connection attempt failed, trying backup connection...");
        
        // Always try anonymous connection as fallback
        const anonymousSuccess = await connectAnonymously();
        
        if (anonymousSuccess) {
          console.log("Anonymous connection successful");
          setConnectionChecked(true);
          setConnectionError(null);
        } else {
          console.log("All connection attempts failed");
          setConnectionError("Databasanslutningen misslyckades");
        }
      }
    } catch (err) {
      console.error("Error checking database connection:", err);
      setConnectionError("Anslutningsfel: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setConnectionChecked(true);
      setIsConnecting(false);
    }
  }, [isOnline]);

  // Function to force a reconnection to the database
  const handleForceReconnect = useCallback(async () => {
    try {
      setIsConnecting(true);
      toast.loading("Återansluter till databasen...");

      // Clear connection cache
      localStorage.removeItem('sb-connection-test');
      localStorage.removeItem('sb-connection-test-time');
      
      // Try direct connection
      const { success } = await testDatabaseAccess();
      
      if (success) {
        toast.success("Återansluten till databasen");
        setConnectionError(null);
        return;
      }

      // Try anonymous connection
      const anonSuccess = await connectAnonymously();
      if (anonSuccess) {
        toast.success("Återansluten till databasen");
        setConnectionError(null);
        return;
      }

      // Fall back to normal connection check
      await checkDatabaseConnection(true);
      
      toast.success("Återanslutning slutförd");
    } catch (error) {
      console.error("Error during force reconnect:", error);
      setConnectionError("Återanslutning misslyckades");
      toast.error("Kunde inte återansluta till databasen");
    } finally {
      setIsConnecting(false);
    }
  }, [checkDatabaseConnection]);

  // Check connection on mount and when online status changes
  useEffect(() => {
    checkDatabaseConnection();
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
