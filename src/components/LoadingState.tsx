
import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Wifi, WifiOff, Database } from "lucide-react";
import { testDatabaseAccess } from "@/components/auth/utils/databaseUtils";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Track loading time
  useEffect(() => {
    if (error) return;
    
    const interval = setInterval(() => {
      setLoadTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [error]);

  // Function to manually check database connection
  const checkDatabaseManually = async () => {
    try {
      setIsCheckingDb(true);
      
      // First clear any cached connection results
      localStorage.removeItem('sb-connection-test');
      localStorage.removeItem('sb-connection-test-time');
      
      // Check session
      console.log("Checking Supabase session...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session exists:", !!session);
      
      // Perform direct API call to test connection
      console.log("Testing direct API connection...");
      const directResponse = await fetch("https://zkrruihxszziifyogzko.supabase.co/rest/v1/leagues?select=id&limit=1", {
        headers: {
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U",
          "Content-Type": "application/json"
        }
      });
      
      if (directResponse.ok) {
        console.log("Direct API test successful");
        const data = await directResponse.json();
        console.log("API data:", data);
        setDbStatus('connected');
        setDbError(null);
      } else {
        console.error("Direct API test failed:", directResponse.status, directResponse.statusText);
        const errorText = await directResponse.text();
        setDbStatus('error');
        setDbError(`API Error: ${directResponse.status} - ${errorText}`);
      }
      
      // Then test with the client
      console.log("Testing database connection via Supabase client...");
      const { success, error } = await testDatabaseAccess();
      
      if (success) {
        setDbStatus('connected');
        setDbError(null);
        console.log("Database connection test successful");
      } else {
        setDbStatus('error');
        setDbError(error || "Unknown database error");
        console.error("Database connection test failed:", error);
      }
    } catch (err) {
      console.error("Error in manual database check:", err);
      setDbStatus('error');
      setDbError(err instanceof Error ? err.message : "Unknown error in manual check");
    } finally {
      setIsCheckingDb(false);
    }
  };

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
          
          {/* Add database diagnostic button */}
          <button
            onClick={checkDatabaseManually}
            disabled={isCheckingDb}
            className="mt-4 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded text-sm flex items-center gap-2 mx-auto"
          >
            <Database className="h-4 w-4" />
            {isCheckingDb ? "Kontrollerar databas..." : "Diagnostisera databasanslutning"}
          </button>
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
        
        {/* Add database diagnostic button */}
        {dbStatus === 'error' && (
          <button
            onClick={checkDatabaseManually}
            disabled={isCheckingDb}
            className="mt-4 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded text-sm flex items-center gap-2 mx-auto"
          >
            <Database className="h-4 w-4" />
            {isCheckingDb ? "Kontrollerar databas..." : "Diagnostisera databasanslutning"}
          </button>
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
