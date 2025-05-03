
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { testDatabaseAccess, checkConnectionWithSession } from "@/components/auth/utils/databaseUtils";
import { 
  ErrorState, 
  NetworkStatus, 
  DatabaseStatus, 
  LoadingSpinner,
  useDatabaseCheck 
} from "./loading";
import { toast } from "sonner";

interface LoadingStateProps {
  message?: string;
  error?: string | null;
  retry?: () => void;  // Ensuring this is "retry" rather than "onRetry"
}

export function LoadingState({ 
  message = "Laddar data från databasen...", 
  error,
  retry 
}: LoadingStateProps) {
  const isOnline = navigator.onLine;
  const { 
    dbStatus, 
    dbError, 
    isCheckingDb, 
    setIsCheckingDb, 
    setDbStatus, 
    connectionAttempts,
    checkDbConnection
  } = useDatabaseCheck(isOnline, error);

  // Track if we're forcing reconnection
  const [isForceReconnecting, setIsForceReconnecting] = useState(false);
  
  // Check if connection is taking too long
  useEffect(() => {
    if (dbStatus === 'connecting' && connectionAttempts > 2 && !isCheckingDb) {
      console.log("Connection appears to be stuck, forcing reconnection...");
      handleForceReconnect();
    }
  }, [dbStatus, connectionAttempts, isCheckingDb]);

  // Function to manually check database connection
  const checkDatabaseManually = async () => {
    try {
      setIsCheckingDb(true);
      toast.loading("Kör diagnostik på databasanslutning...");
      
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
        toast.success("Direkt API-anslutning fungerar!");
      } else {
        console.error("Direct API test failed:", directResponse.status, directResponse.statusText);
        const errorText = await directResponse.text();
        setDbStatus('error');
        toast.error("Direkt API-anslutning misslyckades");
      }
      
      // Then test with the client
      console.log("Testing database connection via Supabase client...");
      const { success, error } = await testDatabaseAccess();
      
      if (success) {
        setDbStatus('connected');
        toast.success("Databasanslutning fungerar!");
        console.log("Database connection test successful");
      } else {
        setDbStatus('error');
        toast.error(`Databasanslutning fungerar inte: ${error}`);
        console.error("Database connection test failed:", error);
      }
    } catch (err) {
      console.error("Error in manual database check:", err);
      toast.error("Ett fel uppstod vid diagnostik");
      setDbStatus('error');
    } finally {
      setIsCheckingDb(false);
    }
  };
  
  // Function to force reconnect database
  const handleForceReconnect = async () => {
    try {
      setIsForceReconnecting(true);
      toast.loading("Försöker återansluta till databasen...");
      
      console.log("Force reconnecting to database...");
      
      // Clear all connection cache
      localStorage.removeItem('sb-connection-test');
      localStorage.removeItem('sb-connection-test-time');
      localStorage.removeItem('sb-connection-error');
      
      // Sign out and sign back in anonymously
      await supabase.auth.signOut({ scope: 'global' });
      
      // Reset database status
      setDbStatus('connecting');
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force a complete connection check
      const isConnected = await checkConnectionWithSession();
      
      if (isConnected) {
        console.log("Force reconnect successful!");
        setDbStatus('connected');
        toast.success("Databasanslutning återupprättad!");
        
        // Force reload page to ensure clean state
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error("Force reconnect failed");
        setDbStatus('error');
        toast.error("Kunde inte återupprätta databasanslutning");
      }
    } catch (err) {
      console.error("Error during force reconnect:", err);
      setDbStatus('error');
      toast.error("Ett fel uppstod vid återanslutning");
    } finally {
      setIsForceReconnecting(false);
    }
  };

  // Show error state if there's an error message
  if (error) {
    return <ErrorState 
      error={error} 
      retry={retry} // Ensuring this is "retry" rather than "onRetry"
      onDiagnostic={checkDatabaseManually} 
      onForceReconnect={handleForceReconnect}
      isCheckingDb={isCheckingDb || isForceReconnecting}
    />;
  }
  
  // Show loading state
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <LoadingSpinner retry={retry} />
        <p>{message}</p>
        
        {/* Network status indicator */}
        <NetworkStatus isOnline={isOnline} />
        
        {/* Database connection status */}
        <DatabaseStatus 
          status={dbStatus} 
          errorMessage={dbError} 
          isOnline={isOnline}
          onDiagnostic={checkDatabaseManually}
          onForceReconnect={handleForceReconnect}
          isCheckingDb={isCheckingDb}
          isForceReconnecting={isForceReconnecting}
          connectionAttempts={connectionAttempts}
        />
      </div>
    </div>
  );
}
