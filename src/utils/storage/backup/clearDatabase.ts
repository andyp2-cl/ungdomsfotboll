
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Clears all existing data from the database before restoration
 */
export const clearExistingData = async (): Promise<{ 
  success: boolean; 
  error?: any 
}> => {
  try {
    console.log("Clearing existing data before restoration...");
    
    // Display toast to notify user
    toast.loading("Rensar befintlig data innan återställning...");
    
    // Clear player_activities relationships first (due to foreign key constraints)
    const { error: paError } = await supabase
      .from('player_activities')
      .delete()
      .gte('id', '0'); // Delete all
      
    if (paError) {
      console.error("Error clearing player_activities:", paError);
      toast.warning("Problem med att rensa spelar-aktivitetsrelationer");
      // Continue despite error
    } else {
      toast.success("Spelar-aktivitetsrelationer rensade");
    }
    
    // Clear activities 
    const { error: actError } = await supabase
      .from('activities')
      .delete()
      .gte('id', '0'); // Delete all
      
    if (actError) {
      console.error("Error clearing activities:", actError);
      toast.warning("Problem med att rensa aktiviteter");
      // Continue despite error
    } else {
      toast.success("Aktiviteter rensade");
    }
    
    // Clear players
    const { error: playerError } = await supabase
      .from('players')
      .delete()
      .gte('id', '0'); // Delete all
      
    if (playerError) {
      console.error("Error clearing players:", playerError);
      toast.warning("Problem med att rensa spelare");
      // Continue despite error
    } else {
      toast.success("Spelare rensade");
    }
    
    console.log("Existing data cleared successfully");
    toast.dismiss();
    return { success: true };
  } catch (error) {
    console.error("Error clearing existing data:", error);
    toast.error("Fel vid rensning av data");
    // We return success true despite errors to allow the restoration to continue
    return { success: true, error };
  }
};
