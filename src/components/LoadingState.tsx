
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { testDatabaseAccess } from "@/components/auth/utils/databaseUtils";
import { 
  ErrorState, 
  NetworkStatus, 
  DatabaseStatus, 
  LoadingSpinner, 
  useDatabaseCheck 
} from "./loading";

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
  const { dbStatus, dbError, isCheckingDb, setIsCheckingDb, setDbStatus } = useDatabaseCheck(isOnline, error);

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
        setIsCheckingDb(false);
      } else {
        console.error("Direct API test failed:", directResponse.status, directResponse.statusText);
        const errorText = await directResponse.text();
        setDbStatus('error');
        setIsCheckingDb(false);
      }
      
      // Then test with the client
      console.log("Testing database connection via Supabase client...");
      const { success, error } = await testDatabaseAccess();
      
      if (success) {
        setDbStatus('connected');
        setIsCheckingDb(false);
        console.log("Database connection test successful");
      } else {
        setDbStatus('error');
        setIsCheckingDb(false);
        console.error("Database connection test failed:", error);
      }
    } catch (err) {
      console.error("Error in manual database check:", err);
      setDbStatus('error');
      setIsCheckingDb(false);
    }
  };

  // Show error state if there's an error message
  if (error) {
    return <ErrorState error={error} retry={retry} />;
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
          isCheckingDb={isCheckingDb}
        />
      </div>
    </div>
  );
}
