
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export supabase client directly
export const supabase = supabaseClient;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = async (): Promise<boolean> => {
  try {
    // Clear any potential cached session state first to ensure a fresh check
    localStorage.removeItem('sb-connection-test');
    
    // Use a simple query that doesn't require permissions to test the connection
    const { data, error } = await supabase
      .from('leagues')  // Using leagues table which should be accessible without RLS restrictions
      .select('id')
      .limit(1);
    
    if (error) {
      console.error("Supabase connection test failed:", error.message);
      return false;
    }
    
    console.log("Supabase connection test successful");
    localStorage.setItem('sb-connection-test', 'true');
    return true;
  } catch (err) {
    console.error("Supabase connection error:", err);
    return false;
  }
};

// Force refresh session at startup and configure session persistence
(() => {
  try {
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
        supabase.auth.refreshSession();
      }
      
      // Configure session persistence in localStorage
      localStorage.setItem('sb-session-persistence', 'true');
      
      // Set session expiry to 30 days
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('supabase.auth.token.expiry', 
        (Date.now() + thirtyDaysInMs).toString());
    }
  } catch (e) {
    console.error("Error configuring session persistence:", e);
  }
})();
