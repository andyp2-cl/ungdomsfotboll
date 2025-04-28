
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export supabase client directly
export const supabase = supabaseClient;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = async (): Promise<boolean> => {
  try {
    // Use a simple query that doesn't require permissions to test the connection
    const { data, error } = await supabase
      .from('leagues')  // Changed to leagues since everyone can view leagues
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
