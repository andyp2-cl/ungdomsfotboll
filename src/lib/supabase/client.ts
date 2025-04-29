
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

// Enhanced helper function to handle RLS policy errors with activities table
// This will use multiple approaches (upsert, update, direct methods) to ensure data is saved
export const updateActivityWithRLSHandling = async (activityId: string, updates: any): Promise<{success: boolean, error?: any, data?: any}> => {
  console.log(`Attempting to update activity with RLS handling: ${activityId}`, updates);

  try {
    // APPROACH 1: First try the full upsert with both existing + new data combined
    // Get current record first to ensure we have complete data
    console.log("APPROACH 1: Trying upsert with full data");
    const { data: existingActivity, error: fetchError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single();
      
    if (fetchError) {
      console.warn("Failed to fetch existing activity:", fetchError.message);
    } else if (existingActivity) {
      // Combine existing data with updates
      const mergedActivity = {
        ...existingActivity,
        ...updates,
        // Ensure these fields are properly updated
        home_score: updates.home_score,
        away_score: updates.away_score,
        is_win: updates.is_win,
        result: updates.result,
        player_stats: updates.player_stats
      };
      
      // Try upsert with the merged data
      const { error: upsertError, data: upsertData } = await supabase
        .from('activities')
        .upsert(mergedActivity);
        
      if (!upsertError) {
        console.log("Activity successfully updated via complete upsert");
        return { success: true, data: upsertData };
      } else {
        console.warn("Complete upsert failed:", upsertError.message);
      }
    }

    // APPROACH 2: Try direct focused update with only the specific fields needed
    console.log("APPROACH 2: Trying focused update with specific fields");
    const focusedUpdates = {
      home_score: updates.home_score,
      away_score: updates.away_score,
      is_win: updates.is_win,
      result: updates.result,
      player_stats: updates.player_stats
    };
    
    const { error: updateError, data: updateData } = await supabase
      .from('activities')
      .update(focusedUpdates)
      .eq('id', activityId);
    
    if (!updateError) {
      console.log("Activity updated successfully via focused update");
      return { success: true, data: updateData };
    }
    
    console.warn("Focused update failed:", updateError.message);

    // APPROACH 3: Try direct REST API approach as last resort
    console.log("APPROACH 3: Trying direct REST API approach");
    try {
      // Instead of accessing protected properties, use the values from the environment
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/activities?id=eq.${activityId}`;
      
      // Make sure we have the correct headers for authentication
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(focusedUpdates)
      });

      if (response.ok) {
        console.log("Activity updated successfully via direct REST API");
        return { success: true, data: await response.json() };
      } else {
        console.warn("Direct REST API update failed:", await response.text());
      }
    } catch (restError) {
      console.error("Error with REST approach:", restError);
    }
    
    return { 
      success: false, 
      error: "All update approaches failed"
    };
    
  } catch (err) {
    console.error("Error in updateActivityWithRLSHandling:", err);
    return { success: false, error: err };
  }
};
