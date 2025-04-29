
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Test if we can access the database - with retry mechanism
export const testDatabaseAccess = async (): Promise<boolean> => {
  try {
    // First check if we have a cached successful test
    const cachedTest = localStorage.getItem('sb-connection-test');
    if (cachedTest === 'true') {
      console.log("Using cached database connection test result");
      return true;
    }
    
    // Try a simple read operation with retry logic
    let attempts = 0;
    let success = false;
    
    while (attempts < 3 && !success) {
      const { data, error } = await supabase
        .from('leagues')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error(`Database access test failed (attempt ${attempts + 1}):`, error);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      } else {
        console.log("Database access test passed:", data);
        success = true;
        
        // Cache successful connection test
        localStorage.setItem('sb-connection-test', 'true');
        
        // Set a timestamp for the last successful test
        localStorage.setItem('sb-connection-test-time', Date.now().toString());
        
        return true;
      }
    }
    
    if (!success) {
      toast.warning("Begränsad databastillgång. Logga in för full funktionalitet.");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error testing database access:", error);
    return false;
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

// Cache a successful connection
export const cacheSuccessfulConnection = () => {
  localStorage.setItem('sb-connection-test', 'true');
  localStorage.setItem('sb-connection-test-time', Date.now().toString());
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
};
