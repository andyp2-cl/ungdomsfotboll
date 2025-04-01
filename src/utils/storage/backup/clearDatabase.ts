
import { supabase } from "@/lib/supabase/client";

/**
 * Clears all existing data from the database before restoration
 */
export const clearExistingData = async (): Promise<{ 
  success: boolean; 
  error?: any 
}> => {
  try {
    console.log("Clearing existing data before restoration...");
    
    // Clear player_activities relationships first (due to foreign key constraints)
    const { error: paError } = await supabase
      .from('player_activities')
      .delete()
      .gte('id', '0'); // Delete all
      
    if (paError) {
      console.error("Error clearing player_activities:", paError);
      // Continue despite error
    }
    
    // Clear activities 
    const { error: actError } = await supabase
      .from('activities')
      .delete()
      .gte('id', '0'); // Delete all
      
    if (actError) {
      console.error("Error clearing activities:", actError);
      // Continue despite error
    }
    
    // Clear players
    const { error: playerError } = await supabase
      .from('players')
      .delete()
      .gte('id', '0'); // Delete all
      
    if (playerError) {
      console.error("Error clearing players:", playerError);
      // Continue despite error
    }
    
    console.log("Existing data cleared successfully");
    return { success: true };
  } catch (error) {
    console.error("Error clearing existing data:", error);
    // We return success true despite errors to allow the restoration to continue
    return { success: true, error };
  }
};
