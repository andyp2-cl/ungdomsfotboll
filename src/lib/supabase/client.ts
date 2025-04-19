
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export supabase client directly
export const supabase = supabaseClient;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = async (): Promise<boolean> => {
  try {
    // Attempt to make a simple query to test the connection
    const { data, error } = await supabase
      .from('activities')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
    
    console.log("Supabase connection test successful");
    return true;
  } catch (err) {
    console.error("Supabase connection test error:", err);
    return false;
  }
};
