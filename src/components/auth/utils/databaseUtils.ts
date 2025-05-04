
import { supabase } from "@/lib/supabase/client";

/**
 * Connect to database anonymously
 * This function attempts to connect to the database without requiring authentication
 */
export async function connectAnonymously(): Promise<boolean> {
  try {
    // Instead of anonymous sign-in, we'll connect directly with the anon key
    const { error } = await supabase.from('leagues').select('id').limit(1);
    
    if (error) {
      console.error("Database anonymous connection test failed:", error);
      return false;
    }
    
    // Cache successful connection
    cacheSuccessfulConnection();
    return true;
  } catch (error) {
    console.error("Error during anonymous connection:", error);
    return false;
  }
}

/**
 * Test database access
 */
export async function testDatabaseAccess(): Promise<{ 
  success: boolean; 
  error?: string;
  rlsEnabled?: boolean;
  details?: any;
}> {
  try {
    // Try to access the leagues table as a simple test
    const { data, error } = await supabase.from('leagues').select('id').limit(1);
    
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
    
    // Cache successful connection
    cacheSuccessfulConnection();
    
    // Check if RLS is enabled by trying to access data that would be restricted
    const isRLSEnabled = false; // We're assuming RLS is disabled for now
    
    return { 
      success: true,
      rlsEnabled: isRLSEnabled
    };
  } catch (error) {
    console.error("Error during database access test:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Cache successful connection status
 */
export function cacheSuccessfulConnection(): void {
  localStorage.setItem('sb-connection-test', 'true');
  localStorage.setItem('sb-connection-test-time', Date.now().toString());
}

/**
 * Check for pending updates
 */
export function checkPendingUpdates(): number {
  // Simplified logic to check for pending updates
  const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
  if (pendingUpdatesJson) {
    try {
      const updates = JSON.parse(pendingUpdatesJson);
      return Object.keys(updates).length;
    } catch (e) {
      console.error("Error parsing pending updates:", e);
    }
  }
  return 0;
}

/**
 * Get connection cache age in minutes
 */
export function getConnectionCacheAge(): number | null {
  const timestamp = localStorage.getItem('sb-connection-test-time');
  if (!timestamp) return null;
  
  const elapsed = Date.now() - parseInt(timestamp, 10);
  return Math.floor(elapsed / (1000 * 60)); // convert to minutes
}

/**
 * Set extended session persistence for long-lived sessions
 */
export function setExtendedSessionPersistence(): void {
  // No need to set session persistence as we're using automatic connection
}

/**
 * Check connection with session
 */
export async function checkConnectionWithSession(): Promise<boolean> {
  return testDatabaseAccess().then(result => result.success);
}
