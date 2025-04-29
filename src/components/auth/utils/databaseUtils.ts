
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

// Function to test if database access is working
export const testDatabaseAccess = async () => {
  try {
    console.log("Testing database access...");
    
    // Check for a session first
    const { data: { session } } = await supabase.auth.getSession();
    
    // Try to fetch data from leagues table
    const { data, error } = await supabase
      .from('leagues')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error("Database access test failed:", error);
      return { success: false, error: error.message };
    }
    
    // Cache successful connection
    localStorage.setItem('sb-connection-test', 'true');
    localStorage.setItem('sb-connection-test-time', Date.now().toString());
    
    console.log("Database access test succeeded:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Error during database access test:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error during database test" 
    };
  }
};

// Function to set extended session persistence
export const setExtendedSessionPersistence = () => {
  try {
    localStorage.setItem('supabase.auth.token.expiryDays', '30');
    return true;
  } catch (err) {
    console.error("Error setting session persistence:", err);
    return false;
  }
};

// Cache successful connection
export const cacheSuccessfulConnection = () => {
  try {
    localStorage.setItem('sb-connection-test', 'true');
    localStorage.setItem('sb-connection-test-time', Date.now().toString());
    return true;
  } catch (err) {
    console.error("Error caching connection:", err);
    return false;
  }
};

// Function to get connection error from localStorage
export const getConnectionError = (): string | null => {
  try {
    return localStorage.getItem('sb-connection-error');
  } catch (err) {
    console.error("Error getting connection error from storage:", err);
    return null;
  }
};

// Function to set connection error in localStorage
export const setConnectionError = (error: string | null): void => {
  try {
    if (error) {
      localStorage.setItem('sb-connection-error', error);
    } else {
      localStorage.removeItem('sb-connection-error');
    }
  } catch (err) {
    console.error("Error setting connection error in storage:", err);
  }
};

// Function to check for pending updates
export const checkPendingUpdates = (): number => {
  try {
    // Here we would check for any locally stored updates
    // For now, we'll just check for pending score updates as an example
    const pendingScoreUpdates = localStorage.getItem('pendingScoreUpdates');
    if (pendingScoreUpdates) {
      const updates = JSON.parse(pendingScoreUpdates);
      return Object.keys(updates).length;
    }
    return 0;
  } catch (err) {
    console.error("Error checking pending updates:", err);
    return 0;
  }
};

// Function to check connection with session - comprehensive test
export const checkConnectionWithSession = async (): Promise<boolean> => {
  try {
    console.log("Checking connection with session...");
    
    // 1. First check if we have a session
    const { data: { session } } = await supabase.auth.getSession();
    
    // 2. If we have a session, try to refresh it
    if (session) {
      console.log("Found existing session, attempting to refresh...");
      try {
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error("Error refreshing session:", error);
        } else {
          console.log("Session refreshed successfully");
        }
      } catch (refreshErr) {
        console.error("Exception during session refresh:", refreshErr);
      }
    } else {
      console.log("No active session found");
    }
    
    // 3. Test database access
    const testResult = await testDatabaseAccess();
    
    // 4. Return success state and cache the result
    if (testResult.success) {
      cacheSuccessfulConnection();
      setConnectionError(null);
      return true;
    } else {
      setConnectionError(testResult.error || "Unknown database connection error");
      return false;
    }
  } catch (err) {
    console.error("Error during connection check with session:", err);
    setConnectionError(err instanceof Error ? err.message : "Unexpected error during connection check");
    return false;
  }
};

// Force reconnect function with better error handling
export const forceReconnect = async (): Promise<boolean> => {
  try {
    console.log("Attempting to force reconnect to Supabase...");
    
    // 1. Clear connection cache
    localStorage.removeItem('sb-connection-test');
    localStorage.removeItem('sb-connection-test-time');
    
    // 2. Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // 3. If we have a session, try to refresh it
    if (session) {
      console.log("Found existing session, attempting to refresh...");
      try {
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error("Error refreshing session:", error);
          // Continue with reconnect attempts even if refresh fails
        } else {
          console.log("Session refreshed successfully");
        }
      } catch (refreshErr) {
        console.error("Exception during session refresh:", refreshErr);
        // Continue with reconnect attempts even if refresh throws
      }
    } else {
      console.log("No active session found during reconnect");
    }
    
    // 4. Test database access
    const testResult = await testDatabaseAccess();
    
    // 5. Return success state
    return testResult.success;
  } catch (err) {
    console.error("Error during force reconnect:", err);
    return false;
  }
};

// Clear auth function that ensures a complete logout and reconnection
export const clearAuthAndReconnect = async (): Promise<boolean> => {
  try {
    console.log("Clearing all auth data and reconnecting...");
    
    // 1. Clear all Supabase-related localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.startsWith('supabase.auth'))) {
        keysToRemove.push(key);
      }
    }
    
    console.log(`Clearing ${keysToRemove.length} Supabase-related localStorage items`);
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // 2. Force signOut with global scope
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error("Error during sign out:", error);
      }
    } catch (signOutErr) {
      console.error("Exception during sign out:", signOutErr);
      // Continue with reconnect even if signOut fails
    }
    
    // 3. Small delay to allow auth changes to propagate
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 4. Test database access
    const testResult = await testDatabaseAccess();
    
    // 5. Return result
    return testResult.success;
  } catch (err) {
    console.error("Error during auth clear and reconnect:", err);
    return false;
  }
};
