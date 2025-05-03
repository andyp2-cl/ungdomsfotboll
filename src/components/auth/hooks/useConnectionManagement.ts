
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, forceResetConnection } from '@/integrations/supabase/client';
import { testDatabaseAccess, connectAnonymously } from '../utils/databaseUtils';
import { toast } from 'sonner';
import { shouldAutoConnectDatabase } from '@/utils/environment';

export function useConnectionManagement(isOnline: boolean) {
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRLSEnabled, setIsRLSEnabled] = useState(true);
  const [connectionStats, setConnectionStats] = useState<any>(null);

  // Check database connection with automatic reconnect if configured
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
      
      // Track debugging stats 
      const stats = {
        attempts: 0,
        startTime: Date.now(),
        queryTimes: [] as number[],
        errors: [] as string[]
      };
      
      // Test if we already have a working connection
      const isConfigured = await isSupabaseConfigured();
      
      if (isConfigured) {
        console.log("Database connection is configured");
        setConnectionChecked(true);
        setConnectionError(null);
        
        // Try to test with actual database access
        const startQuery = Date.now();
        const { success, rlsEnabled, error, details } = await testDatabaseAccess();
        const queryTime = Date.now() - startQuery;
        
        stats.attempts++;
        stats.queryTimes.push(queryTime);
        
        if (success) {
          console.log(`Database test successful in ${queryTime}ms, RLS enabled:`, rlsEnabled);
          stats.success = true;
          stats.responseTime = queryTime;
          stats.details = details;
          
          setIsRLSEnabled(rlsEnabled);
          setConnectionError(null);
          setConnectionStats(stats);
        } else {
          console.log("Database configuration exists but test failed");
          stats.errors.push(error || 'Unknown error');
          stats.success = false;
          setConnectionStats(stats);
          
          // If auto-connect is enabled, try that
          if (shouldAutoConnectDatabase()) {
            stats.attempts++;
            console.log("Auto-connect enabled, attempting anonymous sign-in");
            
            const anonStartTime = Date.now();
            const anonymousSuccess = await connectAnonymously();
            const anonTime = Date.now() - anonStartTime;
            
            stats.queryTimes.push(anonTime);
            
            if (anonymousSuccess) {
              setConnectionError(null);
              stats.success = true;
              stats.anonymousConnection = true;
            } else {
              setConnectionError("Databasanslutning misslyckades");
              stats.errors.push('Anonymous connection failed');
            }
          } else {
            setConnectionError("Databasanslutningen kräver åtkomst");
          }
        }
      } else {
        // If auto-connect is enabled and we're not configured, try anonymous sign-in
        if (shouldAutoConnectDatabase()) {
          stats.attempts++;
          console.log("Auto-connect enabled, attempting anonymous sign-in");
          
          const anonStartTime = Date.now();
          const anonymousSuccess = await connectAnonymously();
          const anonTime = Date.now() - anonStartTime;
          
          stats.queryTimes.push(anonTime);
          
          if (anonymousSuccess) {
            setConnectionChecked(true);
            setConnectionError(null);
            stats.success = true;
            stats.anonymousConnection = true;
            setConnectionStats(stats);
            return;
          } else {
            stats.errors.push('Anonymous connection failed');
          }
        }
        
        console.log("Database connection is not configured");
        setConnectionError("Aktivera DB-åtkomst för databasefunktioner");
      }
      
      // Save connection stats for debugging
      stats.totalTime = Date.now() - stats.startTime;
      setConnectionStats(stats);
      localStorage.setItem('sb-connection-stats', JSON.stringify(stats));
    } catch (err) {
      console.error("Error checking database connection:", err);
      setConnectionError("Anslutningsfel: " + (err instanceof Error ? err.message : String(err)));
      
      // Store error details for debugging
      const errorDetails = {
        message: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        stack: err instanceof Error ? err.stack : undefined
      };
      localStorage.setItem('sb-connection-error', JSON.stringify(errorDetails));
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
      
      // Force reset Supabase connection
      await forceResetConnection();
      
      // Try to connect anonymously if auto-connect is enabled
      if (shouldAutoConnectDatabase()) {
        const success = await connectAnonymously();
        if (success) {
          toast.success("Återansluten till databasen");
          setConnectionError(null);
          return;
        }
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
    connectionStats,
    checkDatabaseConnection,
    handleForceReconnect
  };
}
