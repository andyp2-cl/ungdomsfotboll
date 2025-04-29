
import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Wifi, WifiOff, Database } from "lucide-react";
import { testDatabaseAccess } from "@/components/auth/utils/databaseUtils";

interface LoadingStateProps {
  message?: string;
  error?: string;
  retry?: () => void;
}

export function LoadingState({ 
  message = "Laddar data från databasen...", 
  error,
  retry 
}: LoadingStateProps) {
  const isOnline = navigator.onLine;
  const [loadTime, setLoadTime] = useState(0);
  const [dbStatus, setDbStatus] = useState<'unknown' | 'connecting' | 'connected' | 'error'>('unknown');
  const [dbError, setDbError] = useState<string | null>(null);
  
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
  
  // Track loading time
  useEffect(() => {
    if (error) return;
    
    const interval = setInterval(() => {
      setLoadTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [error]);

  // Show error state if there's an error message
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="mb-4">{error}</p>
          {retry && (
            <button 
              onClick={retry} 
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Försök igen
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Show loading state
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>{message}</p>
        
        {/* Network status indicator */}
        <div className="flex items-center justify-center mt-4 text-sm text-gray-500 gap-1.5">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-green-600" />
              <span>Ansluten till nätverket</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-600" />
              <span>Offline-läge</span>
            </>
          )}
        </div>
        
        {/* Database connection status */}
        {isOnline && (
          <div className="flex items-center justify-center mt-2 text-sm gap-1.5">
            {dbStatus === 'connecting' && (
              <div className="text-amber-600 flex items-center gap-1.5">
                <Database className="h-4 w-4 animate-pulse" />
                <span>Ansluter till databasen...</span>
              </div>
            )}
            
            {dbStatus === 'connected' && (
              <div className="text-green-600 flex items-center gap-1.5">
                <Database className="h-4 w-4" />
                <span>Ansluten till databasen</span>
              </div>
            )}
            
            {dbStatus === 'error' && (
              <div className="text-red-600 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                <span>{dbError || "Databasfel"}</span>
              </div>
            )}
          </div>
        )}
        
        {loadTime > 8 && (
          <p className="text-sm text-gray-500 mt-2">
            Om detta tar lång tid, kontrollera nätverksanslutningen
          </p>
        )}
        
        {/* Alternative action if loading takes too long */}
        {loadTime > 12 && retry && (
          <button 
            onClick={retry} 
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Ladda om data
          </button>
        )}
      </div>
    </div>
  );
}
