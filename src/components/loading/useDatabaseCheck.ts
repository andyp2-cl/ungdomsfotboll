
import { useState } from "react";
import { useConnectionStats } from "./hooks/useConnectionStats";
import { useConnectionCheck } from "./hooks/useConnectionCheck";
import { useReconnectEffects } from "./hooks/useReconnectEffects";
import { DatabaseStatus, UseDatabaseCheckResult } from "./types";

/**
 * Hook for checking and monitoring database connection status
 */
export function useDatabaseCheck(isOnline: boolean, error?: string): UseDatabaseCheckResult {
  // States for database connection monitoring
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>('unknown');
  const [dbError, setDbError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  // Hook to track connection statistics
  const { connectionStats, updateConnectionStats } = useConnectionStats();
  
  // Hook to handle connection checking
  const { isCheckingDb, setIsCheckingDb, checkDbConnection } = useConnectionCheck(
    isOnline,
    error,
    dbStatus,
    setDbStatus,
    setDbError,
    updateConnectionStats,
    connectionAttempts,
    setConnectionAttempts
  );
  
  // Hook to handle automatic reconnection effects
  useReconnectEffects(
    isOnline,
    error,
    dbStatus,
    connectionAttempts,
    checkDbConnection
  );

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
