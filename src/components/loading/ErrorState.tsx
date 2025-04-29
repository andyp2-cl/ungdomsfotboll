
import React, { useState } from "react";
import { AlertCircle, RefreshCw, Database } from "lucide-react";
import { testDatabaseAccess } from "@/components/auth/utils/databaseUtils";
import { supabase } from "@/integrations/supabase/client";

interface ErrorStateProps {
  error: string;
  retry?: () => void;
}

export function ErrorState({ error, retry }: ErrorStateProps) {
  const [isCheckingDb, setIsCheckingDb] = useState(false);

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
      } else {
        console.error("Direct API test failed:", directResponse.status, directResponse.statusText);
        const errorText = await directResponse.text();
        console.error("API Error details:", errorText);
      }
      
      // Then test with the client
      console.log("Testing database connection via Supabase client...");
      const { success, error } = await testDatabaseAccess();
      
      if (success) {
        console.log("Database connection test successful");
      } else {
        console.error("Database connection test failed:", error);
      }
    } catch (err) {
      console.error("Error in manual database check:", err);
    } finally {
      setIsCheckingDb(false);
    }
  };

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
