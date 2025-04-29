
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export supabase client directly
export const supabase = supabaseClient;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = async (): Promise<boolean> => {
  try {
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
    return true;
  } catch (err) {
    console.error("Supabase connection error:", err);
    return false;
  }
};

// Configure session persistence in localStorage
(() => {
  try {
    // This self-invoking function runs once when the file is imported
    // to ensure auth persistence is configured
    const persistSession = localStorage.getItem('persistSession') !== 'false';
    const sessionExpiryDays = 30; // Keep session for 30 days
    
    // Set session expiry to a long period
    localStorage.setItem('supabase.auth.token.expiry', 
      (Date.now() + (sessionExpiryDays * 24 * 60 * 60 * 1000)).toString());
    
    if (persistSession) {
      localStorage.setItem('persistSession', 'true');
    }
    
    console.log("Session persistence configured for", sessionExpiryDays, "days");
  } catch (e) {
    console.error("Error configuring session persistence:", e);
  }
})();
