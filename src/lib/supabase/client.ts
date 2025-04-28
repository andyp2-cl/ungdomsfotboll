
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

// Helper function to handle RLS policy errors with activities table
export const updateActivityWithRLSHandling = async (activityId: string, updates: any): Promise<{success: boolean, error?: any}> => {
  try {
    // Approach 1: Try direct update with specific columns
    const { error: updateError } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', activityId);
    
    if (!updateError) {
      console.log("Activity updated successfully via direct update");
      return { success: true };
    }
    
    console.warn("Direct update failed, attempting upsert:", updateError.message);
    
    // Approach 2: Get current record first
    const { data: existingActivity } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single();
      
    if (!existingActivity) {
      console.error("Activity not found for upsert approach");
      return { success: false, error: "Activity not found" };
    }
    
    // Combine existing data with updates
    const mergedActivity = {
      ...existingActivity,
      ...updates
    };
    
    // Try upsert approach
    const { error: upsertError } = await supabase
      .from('activities')
      .upsert(mergedActivity);
      
    if (!upsertError) {
      console.log("Activity updated successfully via upsert");
      return { success: true };
    }
    
    console.error("Both update methods failed:", upsertError.message);
    return { success: false, error: upsertError };
    
  } catch (err) {
    console.error("Error in updateActivityWithRLSHandling:", err);
    return { success: false, error: err };
  }
};
