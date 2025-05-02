import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Try to connect anonymously to the database
 */
export const connectAnonymously = async (): Promise<boolean> => {
  try {
    console.log("Attempting to connect anonymously");
    
    // Check if we have an existing session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log("Already have an existing session");
      return true;
    }
    
    // No session, try to sign in anonymously
    try {
      console.log("No session found, attempting anonymous sign-in");
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        // Note: Anonymous sign-in might be disabled
        console.error("Anonymous sign-in failed:", error);
        
        // Show info toast after a delay
        setTimeout(() => {
          toast.info("Databasåtkomst kräver inloggning. Använd knappen i menyn för att logga in.");
        }, 2000);
        
        return false;
      }
      
      if (data.session) {
        console.log("Anonymous sign-in successful");
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Error connecting anonymously:", error);
      
      // If anonymous auth is disabled, display info message
      if (error?.code === "anonymous_provider_disabled") {
        console.warn("Anonymous sign-in is disabled");
        toast.info("Databasåtkomst kräver inloggning. Använd knappen i menyn för att logga in.");
        return false;
      }
      
      // If we get here, we failed for some other reason
      throw error;
    }
  } catch (error) {
    console.error("Failed to connect anonymously even after retry:", error);
    return false;
  }
};

/**
 * Check for pending updates in localStorage
 * @returns Number of pending updates
 */
export const checkPendingUpdates = (): number => {
  try {
    const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
    if (!pendingUpdatesJson) {
      return 0;
    }
    
    const pendingUpdates = JSON.parse(pendingUpdatesJson);
    return Object.keys(pendingUpdates).length;
  } catch (error) {
    console.error("Error checking pending updates:", error);
    return 0;
  }
};

/**
 * Safe check for session
 */
export const getSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

/**
 * Check if the current user has database access
 */
export const hasDatabaseAccess = async (): Promise<boolean> => {
  try {
    const session = await getSession();
    return !!session;
  } catch (error) {
    console.error("Error checking database access:", error);
    return false;
  }
};

/**
 * Test database access with current session
 * @returns Object with success status and error message if any
 */
export const testDatabaseAccess = async (): Promise<{ success: boolean; error: string; details?: any }> => {
  try {
    // Check if we have a session first
    const session = await getSession();
    
    if (!session) {
      return { 
        success: false, 
        error: "No active session" 
      };
    }
    
    // Try a simple query to verify connection
    const { data, error } = await supabase
      .from('leagues')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error("Database access test failed:", error);
      return { 
        success: false, 
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details
        }
      };
    }
    
    // Query successful
    return { success: true, error: "" };
  } catch (error) {
    console.error("Unexpected error testing database access:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      details: error
    };
  }
};

/**
 * Check database connection with active session
 */
export const checkConnectionWithSession = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No active session for connection check");
      return false;
    }
    
    // Try a simple query
    const { error } = await supabase
      .from('leagues')
      .select('id')
      .limit(1);
      
    return !error;
  } catch (error) {
    console.error("Error checking connection with session:", error);
    return false;
  }
};

/**
 * Force reconnection to the database
 */
export const forceReconnect = async (): Promise<boolean> => {
  try {
    console.log("Force reconnecting to database...");
    
    // Sign out completely
    await supabase.auth.signOut({ scope: 'global' });
    
    // Clear any cached connection data
    localStorage.removeItem('sb-connection-test');
    localStorage.removeItem('sb-connection-test-time');
    
    // Wait a moment before trying to reconnect
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to connect again
    return await connectAnonymously();
  } catch (error) {
    console.error("Force reconnect failed:", error);
    return false;
  }
};

/**
 * Clear all auth data and reconnect
 */
export const clearAuthAndReconnect = async (): Promise<boolean> => {
  try {
    console.log("Clearing auth data and reconnecting...");
    
    // Sign out completely
    await supabase.auth.signOut({ scope: 'global' });
    
    // Clear all auth-related data from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        localStorage.removeItem(key);
      }
    }
    
    // Clear any connection test data
    localStorage.removeItem('sb-connection-test');
    localStorage.removeItem('sb-connection-test-time');
    localStorage.removeItem('sb-connection-error');
    localStorage.removeItem('db-connection-stats');
    
    // Wait a moment before trying to reconnect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Try to connect again
    return await connectAnonymously();
  } catch (error) {
    console.error("Clear auth and reconnect failed:", error);
    return false;
  }
};

/**
 * Set extended session persistence (30 days)
 */
export const setExtendedSessionPersistence = async (): Promise<void> => {
  try {
    // Using only available properties in the type definition
    await supabase.auth.setSession({
      access_token: "",
      refresh_token: ""
    });
  } catch (error) {
    console.error("Error setting extended session persistence:", error);
  }
};

/**
 * Cache successful connection to prevent excessive checks
 */
export const cacheSuccessfulConnection = (): void => {
  localStorage.setItem('sb-connection-test', 'true');
  localStorage.setItem('sb-connection-test-time', Date.now().toString());
};

/**
 * Get cache age in minutes of last successful connection
 * @returns Number of minutes since last successful connection or null if no cache
 */
export const getConnectionCacheAge = (): number | null => {
  const cacheTimeStr = localStorage.getItem('sb-connection-test-time');
  if (!cacheTimeStr) return null;
  
  const cacheTime = parseInt(cacheTimeStr);
  const ageMs = Date.now() - cacheTime;
  
  // Return age in minutes
  return Math.floor(ageMs / (1000 * 60));
};
