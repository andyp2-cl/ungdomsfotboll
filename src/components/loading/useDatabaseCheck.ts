
import { useState, useEffect } from "react";
import { testDatabaseAccess } from "@/components/auth/utils/databaseUtils";

export function useDatabaseCheck(isOnline: boolean, error?: string) {
  const [dbStatus, setDbStatus] = useState<'unknown' | 'connecting' | 'connected' | 'error'>('unknown');
  const [dbError, setDbError] = useState<string | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);

  // Check database connection on load
  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        setDbStatus('connecting');
        const { success, error } = await testDatabaseAccess();
        if (success) {
          setDbStatus('connected');
          setDbError(null);
        } else {
          setDbStatus('error');
          setDbError(error || "Okänt databasfel");
        }
      } catch (err) {
        setDbStatus('error');
        setDbError(err instanceof Error ? err.message : "Okänt fel");
      }
    };
    
    if (isOnline && !error) {
      checkDbConnection();
    }
  }, [isOnline, error]);

  return {
    dbStatus,
    dbError,
    isCheckingDb,
    setIsCheckingDb
  };
}
