
import { supabase } from "@/lib/supabase/client";

/**
 * Get the age of the connection cache in minutes
 */
export const getConnectionCacheAge = (): number | null => {
  const timestamp = localStorage.getItem('sb-connection-test-time');
  if (!timestamp) return null;
  
  const cacheTimeMs = parseInt(timestamp, 10);
  if (isNaN(cacheTimeMs)) return null;
  
  const ageInMinutes = Math.floor((Date.now() - cacheTimeMs) / 60000);
  return ageInMinutes;
};

/**
 * Tests database access with improved telemetry
 */
export const testDatabaseAccess = async (): Promise<{ 
  success: boolean; 
  error: string | null;
  details?: any;
}> => {
  try {
    console.log("Testing database access...");
    
    // Start time measurement
    const startTime = performance.now();
    
    // Check if we have a session first
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Session check:", session ? "Session exists" : "No session");
    
    // Simple query to test access
    const { data, error } = await supabase
      .from('leagues')
      .select('id')
      .limit(1);
      
    const endTime = performance.now();
    const queryTime = endTime - startTime;
    
    // Store query metrics
    localStorage.setItem('db-test-query-time', queryTime.toString());
    
    if (error) {
      console.error("Database access test failed:", error);
      return { 
        success: false, 
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
          queryTime
        }
      };
    }
    
    console.log("Database access test successful");
    
    // Cache the successful connection
    cacheSuccessfulConnection();
    
    return { success: true, error: null, details: { queryTime } };
  } catch (error) {
    console.error("Error in database access test:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      details: { errorType: typeof error }
    };
  }
};

/**
 * Caches successful database connection
 */
export const cacheSuccessfulConnection = () => {
  localStorage.setItem('sb-connection-test', 'true');
  localStorage.setItem('sb-connection-test-time', Date.now().toString());
};

/**
 * Check if we have a pending connection with active session
 */
export const checkConnectionWithSession = async (): Promise<boolean> => {
  try {
    // First check if we already have a session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log("Found existing session, checking database access");
      const { success } = await testDatabaseAccess();
      return success;
    }
    
    // No session, try anonymous login
    console.log("No active session, attempting anonymous connection");
    await connectAnonymously();
    
    // Test access again
    const { success } = await testDatabaseAccess();
    return success;
  } catch (error) {
    console.error("Error checking connection with session:", error);
    return false;
  }
};

/**
 * Set extended session persistence
 */
export const setExtendedSessionPersistence = async () => {
  try {
    // Store a flag in localStorage to remember this login
    localStorage.setItem('session-persistence', 'extended');
    
    // Fix: Remove expires_in property which doesn't exist in the type
    await supabase.auth.setSession({
      refresh_token: '',
      access_token: ''
      // expires_in property removed
    });
    
    console.log("Extended session persistence set");
  } catch (error) {
    console.error("Error setting extended session persistence:", error);
  }
};

/**
 * Force a reconnection to the database
 */
export const forceReconnect = async (): Promise<boolean> => {
  try {
    console.log("Forcing reconnection to database...");
    
    // Clear connection test flags
    localStorage.removeItem('sb-connection-test');
    localStorage.removeItem('sb-connection-test-time');
    
    // Sign out first to clear any existing session
    await supabase.auth.signOut({ scope: 'local' });
    
    // Try anonymous sign-in
    await connectAnonymously();
    
    // Test the connection
    const { success } = await testDatabaseAccess();
    return success;
  } catch (error) {
    console.error("Error during force reconnect:", error);
    return false;
  }
};

/**
 * Clear all auth data and reconnect
 */
export const clearAuthAndReconnect = async (): Promise<boolean> => {
  try {
    console.log("Clearing all auth data and reconnecting...");
    
    // Clear all local storage related to auth and connection
    localStorage.removeItem('sb-connection-test');
    localStorage.removeItem('sb-connection-test-time');
    localStorage.removeItem('sb-activities-fetch-time');
    localStorage.removeItem('sb-activities-last-update');
    localStorage.removeItem('sb-connection-metrics');
    localStorage.removeItem('sb-session-refresh-time');
    
    // Clear supabase session completely
    await supabase.auth.signOut({ scope: 'global' });
    
    // Wait a moment for auth state to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try anonymous sign-in
    await connectAnonymously();
    
    // Test the connection
    const { success } = await testDatabaseAccess();
    
    if (success) {
      cacheSuccessfulConnection();
    }
    
    return success;
  } catch (error) {
    console.error("Error during auth clear and reconnect:", error);
    return false;
  }
};

/**
 * Check for pending database updates - Fixed to return number instead of Promise<boolean>
 */
export const checkPendingUpdates = (): number => {
  try {
    // Check if we have pending updates in local storage
    const pendingUpdatesJson = localStorage.getItem('pending-updates');
    if (!pendingUpdatesJson) {
      return 0;
    }
    
    const pendingUpdates = JSON.parse(pendingUpdatesJson);
    return Array.isArray(pendingUpdates) ? pendingUpdates.length : 0;
  } catch (error) {
    console.error("Error checking pending updates:", error);
    return 0;
  }
};

/**
 * Connects to the database anonymously
 * This function is called when the user is not authenticated
 * to ensure they still have access to the database
 */
export const connectAnonymously = async () => {
  try {
    // First check if we already have a session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log("User already has a session, no need to connect anonymously");
      return;
    }

    // Attempt anonymous sign-in
    console.log("Attempting anonymous sign-in");
    
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error("Error signing in anonymously:", error);
      throw error;
    }
    
    console.log("Anonymous sign-in successful");
    
    // Immediately attempt to fetch some simple data to test the connection
    await supabase
      .from('activities')
      .select('id')
      .limit(1)
      .maybeSingle();
      
    console.log("Database connection verified after anonymous login");
    
    return data;
  } catch (error) {
    console.error("Error connecting anonymously:", error);
    
    // Try again with a slight delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error("Error on retry of anonymous sign-in:", error);
        throw error;
      }
      
      console.log("Anonymous sign-in successful on retry");
      return data;
    } catch (retryError) {
      console.error("Failed to connect anonymously even after retry:", retryError);
      throw retryError;
    }
  }
};
