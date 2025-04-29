
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Test if we can access the database - with improved error handling and logging
export const testDatabaseAccess = async (): Promise<{success: boolean; error?: string}> => {
  try {
    console.log("Testing database access...");
    
    // First check if we have a cached successful test that's less than 1 hour old
    // (reduced from 6 hours to troubleshoot the connection issue)
    const cachedTest = localStorage.getItem('sb-connection-test');
    const cachedTimestamp = localStorage.getItem('sb-connection-test-time');
    const currentTime = Date.now();
    const oneHourAgo = currentTime - (60 * 60 * 1000);
    
    if (cachedTest === 'true' && cachedTimestamp && parseInt(cachedTimestamp) > oneHourAgo) {
      console.log("Using cached database connection test result (less than 1 hour old)");
      return { success: true };
    }
    
    // Try a simple read operation with retry logic
    let attempts = 0;
    let lastError = null;
    
    while (attempts < 3) {
      console.log(`Database access test attempt ${attempts + 1}...`);
      
      try {
        const { data, error } = await supabase
          .from('leagues')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error(`Database access test failed (attempt ${attempts + 1}):`, error);
          lastError = error;
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        } else {
          console.log("Database access test passed:", data);
          
          // Cache successful connection with current timestamp
          cacheSuccessfulConnection();
          
          return { success: true };
        }
      } catch (err) {
        console.error(`Unexpected error in database access test (attempt ${attempts + 1}):`, err);
        lastError = err;
        attempts++;
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // If we get here, all attempts failed
    const errorMessage = lastError instanceof Error 
      ? lastError.message 
      : lastError ? JSON.stringify(lastError) : 'Unknown database error';
    
    console.error("All database connection attempts failed:", errorMessage);
    toast.warning("Begränsad databastillgång. Logga in för full funktionalitet.");
    
    // Store the error so we can display it in the UI
    localStorage.setItem('sb-connection-error', errorMessage);
    
    return { 
      success: false,
      error: errorMessage
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error testing database access';
    console.error("Error testing database access:", error);
    localStorage.setItem('sb-connection-error', errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Helper to track session persistence
export const setExtendedSessionPersistence = () => {
  localStorage.setItem('sb-session-persistence', 'true');
  
  // Set session expiry to 30 days
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  localStorage.setItem('supabase.auth.token.expiry', 
    (Date.now() + thirtyDaysInMs).toString());
};

// Cache a successful connection with timestamp and clear any error
export const cacheSuccessfulConnection = () => {
  console.log("Caching successful database connection at", new Date().toISOString());
  localStorage.setItem('sb-connection-test', 'true');
  localStorage.setItem('sb-connection-test-time', Date.now().toString());
  localStorage.removeItem('sb-connection-error');
};

// Check for pending updates
export const checkPendingUpdates = () => {
  const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
  if (!pendingUpdatesJson) return 0;
  
  try {
    const pendingUpdates = JSON.parse(pendingUpdatesJson);
    return Object.keys(pendingUpdates).length;
  } catch (error) {
    console.error("Error parsing pending updates:", error);
    return 0;
  }
};

// Clear the connection test cache
export const clearConnectionCache = () => {
  localStorage.removeItem('sb-connection-test');
  localStorage.removeItem('sb-connection-test-time');
  localStorage.removeItem('sb-connection-error');
  console.log("Connection cache cleared at", new Date().toISOString());
};

// Get connection error from local storage
export const getConnectionError = (): string | null => {
  return localStorage.getItem('sb-connection-error');
};
