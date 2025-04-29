
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Test if we can access the database - with improved error handling and logging
export const testDatabaseAccess = async (): Promise<{success: boolean; error?: string}> => {
  try {
    console.log("Testing database access...");
    
    // First check if we have a cached successful test that's less than 30 minutes old
    const cachedTest = localStorage.getItem('sb-connection-test');
    const cachedTimestamp = localStorage.getItem('sb-connection-test-time');
    const currentTime = Date.now();
    const thirtyMinutesAgo = currentTime - (30 * 60 * 1000); // Reduced from 1 hour
    
    if (cachedTest === 'true' && cachedTimestamp && parseInt(cachedTimestamp) > thirtyMinutesAgo) {
      console.log("Using cached database connection test result (less than 30 minutes old)");
      return { success: true };
    }
    
    // Try a simple read operation with retry logic
    let attempts = 0;
    let lastError = null;
    
    while (attempts < 3) {
      console.log(`Database access test attempt ${attempts + 1}...`);
      
      try {
        // First try to get the session and refresh if needed
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("Found session, refreshing before testing database access");
          await supabase.auth.refreshSession();
        } else {
          console.log("No session found, continuing with anonymous access");
        }
        
        // Test accessing leagues table (public data)
        const { data, error } = await supabase
          .from('leagues')
          .select('id')
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.error(`Database access test failed (attempt ${attempts + 1}):`, error);
          lastError = error;
          
          // Try direct API call as a fallback
          try {
            console.log("Trying direct API call as fallback...");
            const response = await fetch("https://zkrruihxszziifyogzko.supabase.co/rest/v1/leagues?select=id&limit=1", {
              headers: {
                "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U",
                "Content-Type": "application/json"
              }
            });
            
            if (response.ok) {
              console.log("Direct API test successful");
              
              // Cache successful connection with current timestamp
              cacheSuccessfulConnection();
              
              return { success: true };
            } else {
              const errorText = await response.text();
              console.error("Direct API test failed:", response.status, errorText);
            }
          } catch (apiErr) {
            console.error("Direct API call failed:", apiErr);
          }
          
          // Wait before retrying
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
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // If we get here, all attempts failed
    const errorMessage = lastError instanceof Error 
      ? lastError.message 
      : lastError ? JSON.stringify(lastError) : 'Unknown database error';
    
    console.error("All database connection attempts failed:", errorMessage);
    
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

// Force a complete authentication reset and new connection
export const forceReconnect = async (): Promise<boolean> => {
  console.log("===== FORCING COMPLETE DATABASE RECONNECTION =====");
  
  try {
    // 1. Clear all Supabase-related localStorage items to ensure a fresh state
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.startsWith('supabase.auth'))) {
        keysToRemove.push(key);
      }
    }
    
    console.log(`Clearing ${keysToRemove.length} Supabase-related localStorage items:`, keysToRemove);
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // 2. Sign out from Supabase to clear any session state
    console.log("Signing out from Supabase...");
    await supabase.auth.signOut({ scope: 'global' });
    
    // 3. Force refresh client
    console.log("Refreshing Supabase client session...");
    await supabase.auth.refreshSession();
    
    // 4. Try to establish a new connection
    console.log("Testing fresh database connection...");
    const { success, error } = await testDatabaseAccess();
    
    if (success) {
      toast.success("Databasanslutning återupprättad");
      return true;
    } else {
      toast.error(`Kunde inte återupprätta anslutningen: ${error}`);
      return false;
    }
  } catch (err) {
    console.error("Error during forced reconnection:", err);
    toast.error("Ett fel uppstod vid återanslutning");
    return false;
  }
};

// Check database connection status and session validity
export const checkConnectionWithSession = async (): Promise<boolean> => {
  try {
    console.log("Performing complete connection check with session validation");
    
    // First check session status
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Session check:", session ? "Active session found" : "No active session");
    
    // Try database access
    const { success, error } = await testDatabaseAccess();
    
    if (success) {
      console.log("Database connection check succeeded");
      return true;
    }
    
    console.error("Database connection check failed:", error);
    
    // If we have a session, try refreshing it and test again
    if (session) {
      try {
        console.log("Refreshing session and retrying");
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error("Session refresh failed:", error);
          return false;
        }
        
        // Try database access again after refresh
        const secondTry = await testDatabaseAccess();
        return secondTry.success;
      } catch (err) {
        console.error("Error during session refresh:", err);
        return false;
      }
    }
    
    return false;
  } catch (err) {
    console.error("Error checking connection with session:", err);
    return false;
  }
};
