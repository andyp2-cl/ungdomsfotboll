
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export supabase client directly
export const supabase = supabaseClient;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = async (): Promise<boolean> => {
  try {
    console.log("Testing Supabase configuration...");
    
    // Clear any potential cached session state first to ensure a fresh check
    localStorage.removeItem('sb-connection-test');
    
    // Use a simple query that doesn't require permissions to test the connection
    const { data, error } = await supabase
      .from('leagues')  // Using leagues table which should be accessible without RLS restrictions
      .select('id')
      .limit(1);
    
    if (error) {
      console.error("Supabase connection test failed:", error.message);
      localStorage.setItem('sb-connection-error', error.message);
      return false;
    }
    
    console.log("Supabase connection test successful, data:", data);
    localStorage.setItem('sb-connection-test', 'true');
    localStorage.setItem('sb-connection-test-time', Date.now().toString());
    localStorage.removeItem('sb-connection-error');
    return true;
  } catch (err) {
    console.error("Supabase connection error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown connection error";
    localStorage.setItem('sb-connection-error', errorMessage);
    return false;
  }
};

// Enhanced session initialization and management
export const initializeSupabaseSession = async (): Promise<boolean> => {
  try {
    console.log("Initializing Supabase session...");
    
    // Get current session state
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Error getting session:", sessionError);
      localStorage.setItem('sb-connection-error', sessionError.message);
      return false;
    }
    
    if (session) {
      console.log("Found existing session, refreshing...");
      
      // Explicitly refresh session to ensure it's valid
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error("Session refresh failed:", refreshError.message);
        localStorage.setItem('sb-connection-error', refreshError.message);
        return false;
      }
      
      console.log("Session refreshed successfully");
      
      // Test database connection after session refresh
      return await isSupabaseConfigured();
    } else {
      console.log("No existing session, trying anonymous access");
      // Try anonymous access for public tables
      return await isSupabaseConfigured();
    }
  } catch (err) {
    console.error("Error initializing Supabase session:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown initialization error";
    localStorage.setItem('sb-connection-error', errorMessage);
    return false;
  }
};

// Force refresh session at startup and configure session persistence
(() => {
  try {
    console.log("Checking for existing session in storage...");
    
    // Get session from storage
    const sessionString = localStorage.getItem('sb-zkrruihxszziifyogzko-auth-token');
    
    if (sessionString) {
      console.log("Found existing session in storage");
      
      // Get the timestamp when we last refreshed the session
      const lastSessionRefresh = localStorage.getItem('sb-last-refresh');
      const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
      
      // If session hasn't been refreshed in the last 30 minutes or never refreshed
      if (!lastSessionRefresh || parseInt(lastSessionRefresh) < thirtyMinutesAgo) {
        console.log("Refreshing Supabase session...");
        
        // Store current refresh time
        localStorage.setItem('sb-last-refresh', Date.now().toString());
        
        // Force refresh of auth session
        supabase.auth.refreshSession().then(({ data, error }) => {
          if (error) {
            console.error("Error refreshing session:", error);
            localStorage.setItem('sb-connection-error', error.message);
          } else {
            console.log("Session refreshed successfully");
            localStorage.removeItem('sb-connection-error');
          }
        });
      }
      
      // Configure session persistence in localStorage
      localStorage.setItem('sb-session-persistence', 'true');
      
      // Set session expiry to 30 days
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('supabase.auth.token.expiry', 
        (Date.now() + thirtyDaysInMs).toString());
      
      // Trigger immediate connection test
      setTimeout(() => {
        isSupabaseConfigured().then(success => {
          console.log("Initial connection test result:", success ? "Connected" : "Failed");
        });
      }, 100);
    } else {
      console.log("No existing session found in storage");
    }
  } catch (e) {
    console.error("Error configuring session persistence:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown session configuration error";
    localStorage.setItem('sb-connection-error', errorMessage);
  }
})();
