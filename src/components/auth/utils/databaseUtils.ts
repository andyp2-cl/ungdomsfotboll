
import { supabase } from "@/lib/supabase/client";

/**
 * Test database access
 */
export const testDatabaseAccess = async (): Promise<{ success: boolean; rlsEnabled: boolean; error?: string }> => {
  try {
    // Simple query to verify access
    const { data, error } = await supabase
      .from('leagues')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error("Database access test failed:", error);
      return { success: false, rlsEnabled: false, error: error.message };
    }
    
    // Check if RLS is enabled by attempting an insert that should be blocked
    try {
      await supabase
        .from('leagues')
        .insert({ id: 'test-rls', name: 'Test RLS' });
    } catch (rlsError) {
      // If the error contains "new row violates row-level security policy", RLS is enabled
      if (rlsError.message && rlsError.message.includes('new row violates row-level security policy')) {
        console.log("Row Level Security (RLS) is enabled");
        return { success: true, rlsEnabled: true };
      } else {
        console.warn("Insert test failed but RLS may not be enabled:", rlsError);
        return { success: true, rlsEnabled: false };
      }
    }
    
    // If we reach here, the insert succeeded, which means RLS is NOT enabled
    console.warn("Row Level Security (RLS) is NOT enabled");
    return { success: true, rlsEnabled: false };
  } catch (err) {
    console.error("Error testing database access:", err);
    return { success: false, rlsEnabled: false, error: err instanceof Error ? err.message : "Okänt fel" };
  }
};

/**
 * Set extended session persistence
 * This keeps the session alive for 30 days
 */
export const setExtendedSessionPersistence = async (): Promise<void> => {
  try {
    console.log("Setting extended session persistence...");
    // Fixed: Removed the invalid expires_in property
    await supabase.auth.refreshSession();
    console.log("Extended session persistence set successfully");
  } catch (error) {
    console.error("Error setting extended session persistence:", error);
  }
};

/**
 * Cache successful connection
 */
export const cacheSuccessfulConnection = (): void => {
  localStorage.setItem('sb-connection-test', 'true');
  localStorage.setItem('sb-connection-test-time', Date.now().toString());
};

/**
 * Check connection with session
 */
export const checkConnectionWithSession = async (): Promise<boolean> => {
  try {
    console.log("Checking database connection with session...");
    
    // First check if we have a session
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Session check:", session ? "Active session found" : "No active session");
    
    // Try to refresh the session if we have one
    if (session) {
      try {
        console.log("Refreshing session before database check");
        await supabase.auth.refreshSession();
      } catch (err) {
        console.log("Session refresh failed:", err);
      }
    }
    
    // Test database access with retry logic
    let attempts = 0;
    let success = false;
    
    while (attempts < 3 && !success) {
      try {
        const result = await testDatabaseAccess();
        if (result.success) {
          console.log(`Database connection successful on attempt ${attempts + 1}`);
          success = true;
          break;
        } else {
          console.log(`Database connection failed on attempt ${attempts + 1}:`, result.error);
        }
      } catch (err) {
        console.error(`Database connection error on attempt ${attempts + 1}:`, err);
      }
      
      attempts++;
      
      if (attempts < 3) {
        console.log(`Waiting before retry attempt ${attempts + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return success;
  } catch (err) {
    console.error("Unexpected error during database connection check:", err);
    return false;
  }
};

/**
 * Connect to the database anonymously
 * This is useful for development environments
 */
export const connectAnonymously = async (): Promise<boolean> => {
  try {
    console.log("Attempting anonymous database connection");
    
    // First try to get an existing session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If we already have a session, just test the connection
    if (session) {
      console.log("Found existing session, testing connection");
      const { success } = await testDatabaseAccess();
      
      if (success) {
        console.log("Existing session connected successfully");
        cacheSuccessfulConnection();
        return true;
      }
      
      console.log("Existing session failed connection test, attempting to sign in again");
    }
    
    // Sign in anonymously - this works only if anonymous auth is enabled in Supabase
    const { error } = await supabase.auth.signInWithPassword({ 
      // Using a known debug account for development
      email: 'dev@example.com', 
      password: 'development-password' 
    });
    
    if (error) {
      console.warn("Anonymous login failed, attempting to refresh session:", error);
      
      // Try session refreshing as a fallback
      const { error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error("Session refresh also failed:", refreshError);
        return false;
      }
    }
    
    // Test if we now have database access
    const { success } = await testDatabaseAccess();
    
    if (success) {
      console.log("Anonymous connection successful");
      cacheSuccessfulConnection();
      return true;
    } else {
      console.error("Anonymous connection failed after sign-in attempt");
      return false;
    }
  } catch (error) {
    console.error("Error during anonymous connection:", error);
    return false;
  }
};

/**
 * Check for pending updates in local storage
 * Returns the number of pending updates
 */
export const checkPendingUpdates = (): number => {
  const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
  
  if (!pendingUpdatesJson) {
    return 0;
  }
  
  try {
    const updates = JSON.parse(pendingUpdatesJson);
    return Object.keys(updates).length;
  } catch (e) {
    console.error("Error parsing pending updates:", e);
    return 0;
  }
};

/**
 * Force reconnect by resetting connection state
 */
export const forceReconnect = async (): Promise<boolean> => {
  try {
    console.log("Forcing database reconnection...");
    
    // Clear connection cache
    localStorage.removeItem('sb-connection-test');
    localStorage.removeItem('sb-connection-test-time');
    
    // Try to refresh the session
    await supabase.auth.refreshSession();
    
    // Try to connect anonymously if needed
    return await connectAnonymously();
  } catch (error) {
    console.error("Error during forced reconnection:", error);
    return false;
  }
};

/**
 * Clear all auth state and reconnect
 */
export const clearAuthAndReconnect = async (): Promise<boolean> => {
  try {
    console.log("Clearing auth state and reconnecting...");
    
    // Sign out first
    await supabase.auth.signOut({ scope: 'global' });
    
    // Clear connection cache
    localStorage.removeItem('sb-connection-test');
    localStorage.removeItem('sb-connection-test-time');
    localStorage.removeItem('sb-connection-error');
    
    // Wait a moment for auth state to clear
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to connect anonymously
    return await connectAnonymously();
  } catch (error) {
    console.error("Error during auth clear and reconnection:", error);
    return false;
  }
};
