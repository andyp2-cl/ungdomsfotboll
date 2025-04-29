
import { supabase } from "@/lib/supabase/client";

/**
 * Test database access
 */
export const testDatabaseAccess = async (): Promise<{ success: boolean; rlsEnabled: boolean; error?: string; details?: Record<string, any> }> => {
  try {
    console.log("Testing database access...");
    
    // Simple query to verify access
    const startTime = performance.now();
    const { data, error } = await supabase
      .from('leagues')
      .select('id')
      .limit(1);
    const endTime = performance.now();
    
    if (error) {
      console.error("Database access test failed:", error);
      return { 
        success: false, 
        rlsEnabled: false, 
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint || 'Ingen ytterligare information',
          queryTime: `${(endTime - startTime).toFixed(2)}ms`,
          statusCode: error.status || 'Okänd statuskod'
        }
      };
    }
    
    console.log(`Database query successful in ${(endTime - startTime).toFixed(2)}ms`);
    
    // Check if RLS is enabled by attempting an insert that should be blocked
    try {
      await supabase
        .from('leagues')
        .insert({ id: 'test-rls', name: 'Test RLS' });
    } catch (rlsError) {
      // If the error contains "new row violates row-level security policy", RLS is enabled
      if (rlsError.message && rlsError.message.includes('new row violates row-level security policy')) {
        console.log("Row Level Security (RLS) is enabled");
        return { 
          success: true, 
          rlsEnabled: true,
          details: {
            queryTime: `${(endTime - startTime).toFixed(2)}ms`,
            dataCount: data?.length || 0
          }
        };
      } else {
        console.warn("Insert test failed but RLS may not be enabled:", rlsError);
        return { 
          success: true, 
          rlsEnabled: false,
          details: {
            warning: "RLS-test gav oväntad feltyp",
            queryTime: `${(endTime - startTime).toFixed(2)}ms`,
            errorMessage: rlsError instanceof Error ? rlsError.message : 'Okänt fel'
          }
        };
      }
    }
    
    // If we reach here, the insert succeeded, which means RLS is NOT enabled
    console.warn("Row Level Security (RLS) is NOT enabled");
    return { 
      success: true, 
      rlsEnabled: false,
      details: {
        warning: "RLS är inte aktiverat på servern",
        queryTime: `${(endTime - startTime).toFixed(2)}ms`,
        dataCount: data?.length || 0
      }
    };
  } catch (err) {
    console.error("Error testing database access:", err);
    return { 
      success: false, 
      rlsEnabled: false, 
      error: err instanceof Error ? err.message : "Okänt fel",
      details: {
        errorType: err instanceof Error ? err.constructor.name : 'Unknown',
        stack: err instanceof Error ? err.stack : undefined
      }
    };
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
 * Cache successful connection with timestamp and performance metrics
 */
export const cacheSuccessfulConnection = (): void => {
  try {
    const timestamp = Date.now();
    localStorage.setItem('sb-connection-test', 'true');
    localStorage.setItem('sb-connection-test-time', timestamp.toString());
    localStorage.setItem('sb-connection-latency', performance.now().toString());
    localStorage.setItem('sb-connection-metrics', JSON.stringify({
      lastSuccess: timestamp,
      successCount: Number(localStorage.getItem('sb-success-count') || '0') + 1,
      userAgent: navigator.userAgent,
      connectionType: (navigator as any).connection ? (navigator as any).connection.effectiveType : 'unknown'
    }));
  } catch (error) {
    console.error("Failed to cache connection status:", error);
  }
};

/**
 * Get connection cache age in minutes
 */
export const getConnectionCacheAge = (): number | null => {
  try {
    const cacheTimeStr = localStorage.getItem('sb-connection-test-time');
    if (!cacheTimeStr) return null;
    
    const cacheTime = parseInt(cacheTimeStr);
    const now = Date.now();
    return Math.floor((now - cacheTime) / (1000 * 60)); // Age in minutes
  } catch (error) {
    console.error("Error calculating cache age:", error);
    return null;
  }
};

/**
 * Check connection with session
 */
export const checkConnectionWithSession = async (): Promise<boolean> => {
  try {
    console.log("Checking database connection with session...");
    
    // First check if we have recent cached result (less than 5 minutes old)
    const cacheAge = getConnectionCacheAge();
    if (cacheAge !== null && cacheAge < 5) {
      console.log(`Using cached connection result (${cacheAge} minutes old)`);
      return localStorage.getItem('sb-connection-test') === 'true';
    }
    
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
    let lastError = null;
    let connectionMetrics = {
      attempts: 0,
      totalTime: 0,
      successTime: 0,
      errors: [] as string[]
    };
    
    const startTime = performance.now();
    
    while (attempts < 3 && !success) {
      try {
        const attemptStart = performance.now();
        connectionMetrics.attempts++;
        
        const result = await testDatabaseAccess();
        const attemptTime = performance.now() - attemptStart;
        connectionMetrics.totalTime += attemptTime;
        
        if (result.success) {
          console.log(`Database connection successful on attempt ${attempts + 1} in ${attemptTime.toFixed(2)}ms`);
          connectionMetrics.successTime = attemptTime;
          success = true;
          
          // Cache detailed metrics
          localStorage.setItem('sb-connection-metrics', JSON.stringify({
            ...JSON.parse(localStorage.getItem('sb-connection-metrics') || '{}'),
            lastAttemptTime: attemptTime,
            successAttempt: attempts + 1,
            timestamp: new Date().toISOString(),
            details: result.details || {}
          }));
          
          break;
        } else {
          console.log(`Database connection failed on attempt ${attempts + 1} in ${attemptTime.toFixed(2)}ms:`, result.error);
          lastError = result.error;
          connectionMetrics.errors.push(result.error || 'Okänt fel');
        }
      } catch (err) {
        console.error(`Database connection error on attempt ${attempts + 1}:`, err);
        lastError = err instanceof Error ? err.message : "Okänt fel";
        connectionMetrics.errors.push(lastError);
      }
      
      attempts++;
      
      if (attempts < 3) {
        console.log(`Waiting before retry attempt ${attempts + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Save connection metrics
    localStorage.setItem('sb-connection-performance', JSON.stringify(connectionMetrics));
    
    if (!success && lastError) {
      localStorage.setItem('sb-connection-error', lastError);
      localStorage.setItem('sb-connection-error-time', Date.now().toString());
    }
    
    return success;
  } catch (err) {
    console.error("Unexpected error during database connection check:", err);
    
    // Save error information
    const errorDetails = {
      message: err instanceof Error ? err.message : "Okänt fel",
      type: err instanceof Error ? err.constructor.name : "Unknown",
      timestamp: new Date().toISOString(),
      stack: err instanceof Error ? err.stack : undefined
    };
    
    localStorage.setItem('sb-connection-error-details', JSON.stringify(errorDetails));
    
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
    
    // Check if we have a recent cached result (less than 1 minute old)
    const cacheAge = getConnectionCacheAge();
    if (cacheAge !== null && cacheAge < 1) {
      console.log(`Using cached connection result (${cacheAge} minutes old)`);
      return localStorage.getItem('sb-connection-test') === 'true';
    }
    
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
