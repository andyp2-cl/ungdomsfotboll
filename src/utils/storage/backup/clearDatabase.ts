
import { supabase, forceResetConnection } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Tests database connection with write permissions
 */
const testDatabaseWritePermissions = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log("Testing database write permissions before clearing...");
    
    // First try a simple query to verify connection
    const { error: readError } = await supabase
      .from('players')
      .select('count')
      .limit(1);
      
    if (readError) {
      console.error("Database read test failed:", readError);
      return { success: false, error: readError };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error testing database permissions:", error);
    return { success: false, error };
  }
};

/**
 * Clears all existing data from the database before restoration with enhanced error handling
 */
export const clearExistingData = async (): Promise<{ 
  success: boolean; 
  error?: any 
}> => {
  try {
    console.log("Clearing existing data before restoration...");
    
    // Display toast to notify user
    toast.loading("Rensar befintlig data innan återställning...");
    
    // First test database permissions
    const { success: hasPermissions, error: permissionError } = await testDatabaseWritePermissions();
    
    if (!hasPermissions) {
      console.error("Permission check failed:", permissionError);
      
      // Try to force reconnect to database
      console.log("Attempting to force reconnection to database...");
      toast.info("Försöker återansluta till databasen...");
      
      const reconnectSuccess = await forceResetConnection();
      
      if (!reconnectSuccess) {
        console.error("Reconnection attempt failed");
        toast.error("Kunde inte återansluta till databasen");
        return { success: false, error: "Database connection failed" };
      }
      
      console.log("Database reconnection successful");
      toast.success("Databasanslutning återupprättad");
    }
    
    // Clear player_activities relationships first (due to foreign key constraints)
    const { error: paError, count: paCount } = await supabase
      .from('player_activities')
      .delete()
      .gte('id', '0') // Delete all
      .select('count');
      
    if (paError) {
      console.error("Error clearing player_activities:", paError);
      toast.warning("Problem med att rensa spelar-aktivitetsrelationer");
      // Continue despite error
    } else {
      console.log(`Cleared ${paCount || 'all'} player-activity relationships`);
      toast.success("Spelar-aktivitetsrelationer rensade");
    }
    
    // Clear activities 
    const { error: actError, count: actCount } = await supabase
      .from('activities')
      .delete()
      .gte('id', '0') // Delete all
      .select('count');
      
    if (actError) {
      console.error("Error clearing activities:", actError);
      toast.warning("Problem med att rensa aktiviteter");
      // Continue despite error
    } else {
      console.log(`Cleared ${actCount || 'all'} activities`);
      toast.success("Aktiviteter rensade");
    }
    
    // Clear players
    const { error: playerError, count: playerCount } = await supabase
      .from('players')
      .delete()
      .gte('id', '0') // Delete all
      .select('count');
      
    if (playerError) {
      console.error("Error clearing players:", playerError);
      toast.warning("Problem med att rensa spelare");
      // Continue despite error
    } else {
      console.log(`Cleared ${playerCount || 'all'} players`);
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
