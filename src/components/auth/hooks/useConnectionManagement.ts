
import { useState, useEffect, useCallback } from 'react';
import { testDatabaseAccess, forceReconnect, clearAuthAndReconnect } from '../utils/databaseUtils';
import { toast } from 'sonner';

export function useConnectionManagement() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dbStatus, setDbStatus] = useState('unknown');
  const [dbError, setDbError] = useState<string | null>(null);
  const [connectionStats, setConnectionStats] = useState({
    attempts: 0,
    successes: 0,
    failures: 0,
    lastAttempt: null as number | null,
    lastSuccess: null as number | null,
    avgResponseTime: 0
  });
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isCheckingDb, setIsCheckingDb] = useState(false);

  // Track online status
  useEffect(() => {
    const handleOnline = () => {
      console.log("Device is online");
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log("Device is offline");
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update connection statistics
  const updateConnectionStats = useCallback((success: boolean, timeTaken: number) => {
    setConnectionStats(prev => {
      const newStats = {
        attempts: prev.attempts + 1,
        successes: success ? prev.successes + 1 : prev.successes,
        failures: !success ? prev.failures + 1 : prev.failures,
        lastAttempt: Date.now(),
        lastSuccess: success ? Date.now() : prev.lastSuccess,
        avgResponseTime: prev.attempts === 0 
          ? timeTaken 
          : (prev.avgResponseTime * prev.attempts + timeTaken) / (prev.attempts + 1)
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('db-connection-stats', JSON.stringify(newStats));
      
      return newStats;
    });
  }, []);

  // Check database connection
  const checkDbConnection = useCallback(async (force = false) => {
    if (!isOnline) {
      console.log("Skip database check - device is offline");
      return;
    }
    
    if (dbStatus === 'connected' && !force) {
      return;
    }
    
    try {
      console.log("Checking database connection...");
      setDbStatus('connecting');
      setIsCheckingDb(true);
      const startTime = performance.now();
      
      // Test database access
      const result = await testDatabaseAccess();
      const timeTaken = performance.now() - startTime;
      
      // Update connection stats
      updateConnectionStats(result.success, timeTaken);
      
      if (result.success) {
        console.log(`Database connection successful in ${timeTaken.toFixed(2)}ms`);
        setDbStatus('connected');
        setDbError(null);
      } else {
        console.log(`Database connection failed: ${result.error}`);
        setDbStatus('error');
        setDbError(result.error || "Unknown database error");
        setConnectionAttempts(prev => prev + 1);
      }
    } catch (err) {
      console.error("Error checking database connection:", err);
      setDbStatus('error');
      setDbError(err instanceof Error ? err.message : "Unknown error");
      setConnectionAttempts(prev => prev + 1);
      
      // Update stats for failed connection
      updateConnectionStats(false, 0);
    } finally {
      setIsCheckingDb(false);
    }
  }, [isOnline, dbStatus, updateConnectionStats]);

  // Force reconnect to database
  const handleForceReconnect = useCallback(async () => {
    try {
      setIsCheckingDb(true);
      toast.loading("Försöker återansluta till databasen...");
      
      const success = await forceReconnect();
      
      if (success) {
        toast.success("Återanslutning lyckades!");
        setDbStatus('connected');
        setDbError(null);
      } else {
        toast.error("Återanslutning misslyckades");
        setDbStatus('error');
      }
    } catch (error) {
      console.error("Error during force reconnect:", error);
      toast.error("Ett fel uppstod vid återanslutning");
    } finally {
      setIsCheckingDb(false);
    }
  }, []);

  // Clear all auth data and reconnect
  const handleClearAndReconnect = useCallback(async () => {
    try {
      setIsCheckingDb(true);
      toast.loading("Rensar autentiseringsdata och återansluter...");
      
      const success = await clearAuthAndReconnect();
      
      if (success) {
        toast.success("Återanslutning lyckades!");
        setDbStatus('connected');
        setDbError(null);
      } else {
        toast.error("Återanslutning misslyckades");
        setDbStatus('error');
      }
    } catch (error) {
      console.error("Error during clear and reconnect:", error);
      toast.error("Ett fel uppstod vid återanslutning");
    } finally {
      setIsCheckingDb(false);
    }
  }, []);

  return {
    isOnline,
    dbStatus,
    dbError,
    connectionStats,
    connectionAttempts,
    isCheckingDb,
    setDbStatus,
    setDbError,
    checkDbConnection: checkDbConnection,
    updateConnectionStats,
    setConnectionAttempts,
    handleForceReconnect,
    handleClearAndReconnect
  };
}
