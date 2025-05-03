
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, forceResetConnection } from '@/integrations/supabase/client';
import { testDatabaseAccess, connectAnonymously } from '../utils/databaseUtils';
import { toast } from 'sonner';
import { shouldAutoConnectDatabase } from '@/utils/environment';

// Define the type for the connection stats
interface ConnectionStats {
  attempts: number;
  startTime: number;
  queryTimes: number[];
  errors: string[];
  success?: boolean;
  responseTime?: number;
  details?: Record<string, any>;
  anonymousConnection?: boolean;
  totalTime?: number;
}

export function useConnectionManagement(isOnline: boolean) {
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRLSEnabled, setIsRLSEnabled] = useState(true);
  const [connectionStats, setConnectionStats] = useState<ConnectionStats | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Check database connection with automatic reconnect if configured
  const checkDatabaseConnection = useCallback(async (forceCheck = false) => {
    if (!isOnline) {
      console.log("Skip connection check - device is offline");
      setConnectionChecked(true);
      return;
    }

    try {
      setIsConnecting(true);
      setConnectionAttempts(prev => prev + 1);
      
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
      const stats: ConnectionStats = {
        attempts: 0,
        startTime: Date.now(),
        queryTimes: [],
        errors: []
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

          // Save successful connection test
          localStorage.setItem('sb-connection-test', 'true');
          localStorage.setItem('sb-connection-test-time', Date.now().toString());
          
          // Also save activities fetch time to force a refresh
          localStorage.removeItem('sb-activities-last-update');
          localStorage.removeItem('sb-activities-fetch-time');
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
              
              // Force activity data refresh
              localStorage.removeItem('sb-activities-last-update');
              localStorage.removeItem('sb-activities-fetch-time');
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

            // Force activity data refresh
            localStorage.removeItem('sb-activities-last-update');
            localStorage.removeItem('sb-activities-fetch-time');
            
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
      localStorage.setItem('sb-connection-metrics', JSON.stringify({
        timestamp: Date.now(),
        attempts: stats.attempts,
        success: stats.success || false,
        totalTime: stats.totalTime,
        userAgent: navigator.userAgent,
        connectionType: (navigator as any).connection ? (navigator as any).connection.effectiveType : 'unknown',
        lastAttemptTime: stats.queryTimes.length > 0 ? stats.queryTimes[stats.queryTimes.length - 1] : null,
        successAttempt: stats.attempts
      }));
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
      localStorage.removeItem('sb-activities-last-update');
      localStorage.removeItem('sb-activities-fetch-time');
      
      // Force reset Supabase connection
      await forceResetConnection();
      
      // Try to connect anonymously if auto-connect is enabled
      if (shouldAutoConnectDatabase()) {
        const success = await connectAnonymously();
        if (success) {
          toast.success("Återansluten till databasen");
          setConnectionError(null);
          
          // Force a reload of the page to ensure clean state
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          
          return;
        }
      }

      // Fall back to normal connection check
      await checkDatabaseConnection(true);
      
      toast.success("Återanslutning slutförd");
      
      // Force a reload of the page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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

  // Auto-retry if we have errors and are online
  useEffect(() => {
    if (connectionError && isOnline && connectionAttempts < 3) {
      const retryTimer = setTimeout(() => {
        console.log(`Auto-retrying connection check (attempt ${connectionAttempts + 1})`);
        checkDatabaseConnection(true);
      }, 3000 * connectionAttempts);
      
      return () => clearTimeout(retryTimer);
    }
  }, [connectionError, isOnline, connectionAttempts, checkDatabaseConnection]);

  return {
    connectionChecked,
    isConnecting, 
    connectionError,
    isRLSEnabled,
    connectionStats,
    connectionAttempts,
    checkDatabaseConnection,
    handleForceReconnect
  };
}
